import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LandingPage() {
  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md mx-auto">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Acceso</TabsTrigger>
            <TabsTrigger value="room">Sala</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Acceso</CardTitle>
                <CardDescription>Ingresa tus credenciales para continuar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input type="email" placeholder="Correo electrónico" className="w-full" />
                </div>
                <div className="space-y-2">
                  <Input type="password" placeholder="Contraseña" className="w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full font-swiss italic">Acceso</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="room">
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">¿No estás registrado?</CardTitle>
                <CardDescription>Crea o únete a una sala existente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Crear Sala</h3>
                    <Input type="text" placeholder="Nombre de la Sala" className="w-full" />
                    <Button className="w-full mt-2 font-swiss italic">Crear Sala</Button>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">o</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Unirse a la Sala</h3>
                    <Input type="text" placeholder="Código de la Sala" className="w-full" />
                    <Button className="w-full mt-2 font-swiss italic" variant="outline">Unirse a la Sala</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
