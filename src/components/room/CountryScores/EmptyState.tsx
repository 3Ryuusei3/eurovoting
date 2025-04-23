import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Puntuaciones por país</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center py-8 text-muted-foreground">
          No se encontraron puntuaciones para esta sala.
          <br />
          <small className="block mt-2">Si crees que debería haber puntuaciones, revisa la consola para más información.</small>
        </p>
      </CardContent>
    </Card>
  )
}
