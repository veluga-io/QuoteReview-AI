import * as XLSX from 'xlsx'
import type { ParsedQuote, QuoteMetadata, LineItem, QuoteTotals } from '../types/validation'

export interface ExtractedField {
  label: string
  location: string
  sample_value: string
  field_type: 'metadata' | 'line_item' | 'total'
}

export interface TemplateAnalysis {
  fields: ExtractedField[]
  metadata_fields: ExtractedField[]
  line_item_columns: ExtractedField[]
  total_fields: ExtractedField[]
}

/**
 * Excel 파일을 읽어서 ParsedQuote 객체로 변환
 * @param file - 업로드된 Excel 파일
 * @returns ParsedQuote 객체
 */
export async function parseExcelFile(file: File): Promise<ParsedQuote> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const data = e.target?.result
        if (!data) {
          throw new Error('파일을 읽을 수 없습니다')
        }

        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // 시트를 JSON으로 변환
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

        // 견적서 파싱
        const parsed = parseQuoteData(jsonData, worksheet)
        resolve(parsed)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('파일 읽기 중 오류가 발생했습니다'))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * Excel 데이터를 ParsedQuote로 변환
 * 이 함수는 표준 견적서 포맷을 가정합니다.
 * 실제 구현에서는 템플릿에 따라 파싱 로직을 조정해야 합니다.
 */
function parseQuoteData(data: unknown[][], worksheet: XLSX.WorkSheet): ParsedQuote {
  // 메타데이터 추출 (첫 몇 행)
  const metadata: QuoteMetadata = {
    customer_name: findCellValue(worksheet, '고객명') || findCellValue(worksheet, 'Customer'),
    quote_number: findCellValue(worksheet, '견적번호') || findCellValue(worksheet, 'Quote Number'),
    quote_date:
      findCellValue(worksheet, '견적일자') || findCellValue(worksheet, 'Quote Date'),
    valid_until:
      findCellValue(worksheet, '유효기한') || findCellValue(worksheet, 'Valid Until'),
    currency: findCellValue(worksheet, '통화') || findCellValue(worksheet, 'Currency') || 'KRW',
  }

  // 라인 항목 추출 (테이블 형식)
  const lineItems: LineItem[] = extractLineItems(data)

  // 총액 추출
  const totals: QuoteTotals = extractTotals(worksheet)

  return {
    metadata,
    line_items: lineItems,
    totals,
    raw_data: { data, worksheet: Object.keys(worksheet) },
  }
}

/**
 * 워크시트에서 특정 레이블의 값을 찾습니다
 */
function findCellValue(worksheet: XLSX.WorkSheet, label: string): string | undefined {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100')

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[cellAddress]

      if (cell && cell.v && String(cell.v).includes(label)) {
        // 다음 셀이나 같은 행의 오른쪽 셀에서 값 찾기
        const nextCellAddress = XLSX.utils.encode_cell({ r: R, c: C + 1 })
        const nextCell = worksheet[nextCellAddress]

        if (nextCell && nextCell.v) {
          return String(nextCell.v)
        }

        // 다음 행에서 값 찾기
        const belowCellAddress = XLSX.utils.encode_cell({ r: R + 1, c: C })
        const belowCell = worksheet[belowCellAddress]

        if (belowCell && belowCell.v) {
          return String(belowCell.v)
        }
      }
    }
  }

  return undefined
}

/**
 * 라인 항목 추출
 * "품목", "Item", "Description" 등의 헤더를 찾아서 테이블 형식 데이터 추출
 */
function extractLineItems(data: unknown[][]): LineItem[] {
  const lineItems: LineItem[] = []

  // 헤더 행 찾기
  let headerRowIndex = -1
  let headerMap: Record<string, number> = {}

  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i] as string[]
    if (
      row.some(
        cell =>
          cell &&
          (String(cell).includes('품목') ||
            String(cell).includes('Description') ||
            String(cell).includes('Item'))
      )
    ) {
      headerRowIndex = i
      // 헤더 매핑 생성
      row.forEach((cell, index) => {
        if (cell) {
          const cellStr = String(cell).toLowerCase()
          if (cellStr.includes('품목') || cellStr.includes('description'))
            headerMap['description'] = index
          if (cellStr.includes('수량') || cellStr.includes('quantity'))
            headerMap['quantity'] = index
          if (cellStr.includes('단가') || cellStr.includes('unit')) headerMap['unit_price'] = index
          if (cellStr.includes('금액') || cellStr.includes('total')) headerMap['line_total'] = index
          if (cellStr.includes('할인') || cellStr.includes('discount'))
            headerMap['discount'] = index
        }
      })
      break
    }
  }

  if (headerRowIndex === -1) {
    // 헤더를 찾지 못한 경우 기본 구조 가정
    return []
  }

  // 데이터 행 추출
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i] as (string | number)[]

    // 빈 행이거나 합계 행인 경우 중단
    if (
      !row ||
      row.length === 0 ||
      row.every(cell => !cell) ||
      String(row[0]).includes('합계') ||
      String(row[0]).includes('Total')
    ) {
      break
    }

    const description = row[headerMap['description']]
    const quantity = row[headerMap['quantity']]
    const unit_price = row[headerMap['unit_price']]
    const line_total = row[headerMap['line_total']]

    if (description && quantity && unit_price) {
      lineItems.push({
        item_number: i - headerRowIndex,
        description: String(description),
        quantity: Number(quantity) || 0,
        unit_price: Number(unit_price) || 0,
        line_total: Number(line_total) || Number(quantity) * Number(unit_price),
      })
    }
  }

  return lineItems
}

/**
 * 총액 정보 추출
 */
function extractTotals(worksheet: XLSX.WorkSheet): QuoteTotals {
  const subtotal =
    Number(findCellValue(worksheet, '소계')) ||
    Number(findCellValue(worksheet, 'Subtotal')) ||
    0
  const discount =
    Number(findCellValue(worksheet, '할인')) || Number(findCellValue(worksheet, 'Discount')) || 0
  const taxRate =
    Number(findCellValue(worksheet, '세율')) || Number(findCellValue(worksheet, 'Tax Rate')) || 0.1
  const taxAmount =
    Number(findCellValue(worksheet, '세액')) || Number(findCellValue(worksheet, 'Tax')) || 0
  const total =
    Number(findCellValue(worksheet, '총액')) || Number(findCellValue(worksheet, 'Total')) || 0

  return {
    subtotal,
    discount_amount: discount,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total,
  }
}

/**
 * 파일 크기 검증
 */
export function validateFileSize(file: File, maxSizeMB: number = 100): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * 파일 확장자 검증
 */
export function validateFileExtension(file: File): boolean {
  const allowedExtensions = ['.xlsx', '.xls', '.xlsm']
  const fileName = file.name.toLowerCase()
  return allowedExtensions.some(ext => fileName.endsWith(ext))
}

/**
 * 템플릿 파일 분석 - 필드와 구조 자동 추출
 * @param file - 템플릿 Excel 파일
 * @returns 추출된 필드 정보
 */
export async function analyzeTemplateFile(file: File): Promise<TemplateAnalysis> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const data = e.target?.result
        if (!data) {
          throw new Error('파일을 읽을 수 없습니다')
        }

        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        const fields: ExtractedField[] = []
        const metadata_fields: ExtractedField[] = []
        const line_item_columns: ExtractedField[] = []
        const total_fields: ExtractedField[] = []

        // 메타데이터 필드 추출
        const metadataLabels = [
          '고객명',
          'Customer',
          '견적번호',
          'Quote Number',
          '견적일자',
          'Quote Date',
          '유효기한',
          'Valid Until',
          '통화',
          'Currency',
        ]

        metadataLabels.forEach(label => {
          const value = findCellValue(worksheet, label)
          if (value) {
            const field: ExtractedField = {
              label,
              location: findCellLocation(worksheet, label) || '',
              sample_value: value,
              field_type: 'metadata',
            }
            metadata_fields.push(field)
            fields.push(field)
          }
        })

        // 라인 항목 컬럼 추출 (테이블 헤더)
        const lineItemLabels = [
          '품목',
          'Item',
          '설명',
          'Description',
          '수량',
          'Quantity',
          '단가',
          'Unit Price',
          '금액',
          'Amount',
          'Total',
        ]

        lineItemLabels.forEach(label => {
          const location = findCellLocation(worksheet, label)
          if (location) {
            const value = findCellValue(worksheet, label) || label
            const field: ExtractedField = {
              label,
              location,
              sample_value: value,
              field_type: 'line_item',
            }
            line_item_columns.push(field)
            fields.push(field)
          }
        })

        // 총액 필드 추출
        const totalLabels = ['소계', 'Subtotal', '할인', 'Discount', '세액', 'Tax', '총액', 'Total']

        totalLabels.forEach(label => {
          const value = findCellValue(worksheet, label)
          if (value !== undefined) {
            const field: ExtractedField = {
              label,
              location: findCellLocation(worksheet, label) || '',
              sample_value: String(value),
              field_type: 'total',
            }
            total_fields.push(field)
            fields.push(field)
          }
        })

        resolve({
          fields,
          metadata_fields,
          line_item_columns,
          total_fields,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('파일 읽기 중 오류가 발생했습니다'))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * 워크시트에서 특정 레이블의 셀 위치를 찾습니다
 */
function findCellLocation(worksheet: XLSX.WorkSheet, label: string): string | undefined {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100')

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[cellAddress]

      if (cell && cell.v && String(cell.v).includes(label)) {
        return cellAddress
      }
    }
  }

  return undefined
}
