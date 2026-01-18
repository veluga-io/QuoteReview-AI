import { Container } from '@mui/material'
import TemplateForm from '../components/templates/TemplateForm'

export default function TemplateNew() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <TemplateForm />
    </Container>
  )
}
