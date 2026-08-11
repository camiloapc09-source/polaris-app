import { prisma } from '@/lib/db'
import { ListChecks, AlertTriangle } from 'lucide-react'
import {
  NuevoCargoButton,
  AgregarTareaButton,
  DuplicarButton,
  TareaActions,
} from './PlantillaActions'

export default async function AdminPlantillasPage() {
  const [plantillas, employees] = await Promise.all([
    prisma.checklistTemplate.findMany({ orderBy: [{ position: 'asc' }, { order: 'asc' }] }),
    prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      select: { firstName: true, lastName: true, position: true },
      orderBy: { firstName: 'asc' },
    }),
  ])

  // Agrupar por cargo
  const porCargo = new Map<string, typeof plantillas>()
  for (const t of plantillas) {
    if (!porCargo.has(t.position)) porCargo.set(t.position, [])
    porCargo.get(t.position)!.push(t)
  }

  const cargosDeTrabajadores = Array.from(new Set(employees.map((e) => e.position)))
  const cargosConPlantillaActiva = new Set(plantillas.filter((t) => t.isActive).map((t) => t.position))
  const cargosHuerfanos = employees.filter((e) => !cargosConPlantillaActiva.has(e.position))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ color: '#A2A2A2', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Star Shine · Polaris
          </p>
          <h1 style={{ color: '#0F1026', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
            Plantillas de Tareas
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 14, marginTop: 6 }}>
            Las funciones que se evalúan en la revisión mensual, definidas por cargo
          </p>
        </div>
        <NuevoCargoButton cargosSugeridos={cargosDeTrabajadores} />
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #4429A6 0%, #7F71D9 100%)', borderRadius: 16, padding: 24, color: 'white' }}>
          <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 8, fontWeight: 500 }}>Cargos con plantilla</p>
          <p style={{ fontSize: 32, fontWeight: 800 }}>{porCargo.size}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Tareas activas</p>
          <p style={{ color: '#15803D', fontSize: 32, fontWeight: 800 }}>{plantillas.filter((t) => t.isActive).length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #EFEFEF' }}>
          <p style={{ color: '#A2A2A2', fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Tareas desactivadas</p>
          <p style={{ color: '#BBBBBB', fontSize: 32, fontWeight: 800 }}>{plantillas.filter((t) => !t.isActive).length}</p>
        </div>
      </div>

      {/* Trabajadores cuyo cargo no tiene plantilla activa */}
      {cargosHuerfanos.length > 0 && (
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 14,
          padding: '16px 18px', marginBottom: 28,
        }}>
          <AlertTriangle size={18} color="#A16207" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: '#A16207', lineHeight: 1.55 }}>
            <strong>Trabajadores sin plantilla para su cargo.</strong> No se les puede crear revisión:{' '}
            {cargosHuerfanos.map((e) => `${e.firstName} ${e.lastName} ("${e.position}")`).join(', ')}.
            <br />
            Crea la plantilla de ese cargo, o duplica una existente y renómbrala.
          </div>
        </div>
      )}

      {porCargo.size === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', padding: '48px 24px', textAlign: 'center' }}>
          <ListChecks size={28} color="#DDDDDD" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1026' }}>No hay plantillas todavía</p>
          <p style={{ fontSize: 13, color: '#A2A2A2', marginTop: 4 }}>
            Crea la primera con el botón &ldquo;Nuevo cargo&rdquo;.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from(porCargo.entries()).map(([position, tareas]) => {
            const activas = tareas.filter((t) => t.isActive).length
            const quienes = employees.filter((e) => e.position === position)

            return (
              <div key={position} style={{ background: 'white', borderRadius: 16, border: '1px solid #EFEFEF', overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px', borderBottom: '1px solid #F8F8F8', flexWrap: 'wrap', gap: 12,
                }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0F1026' }}>{position}</p>
                    <p style={{ fontSize: 12, color: '#A2A2A2', marginTop: 2 }}>
                      {activas} de {tareas.length} tareas activas
                      {quienes.length > 0
                        ? ` · ${quienes.map((e) => `${e.firstName} ${e.lastName}`).join(', ')}`
                        : ' · sin trabajadores en este cargo'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <DuplicarButton fromPosition={position} cargosSugeridos={cargosDeTrabajadores} />
                    <AgregarTareaButton position={position} />
                  </div>
                </div>

                <div style={{ padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tareas.map((t) => (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: t.isActive ? '#F8F8FB' : '#FAFAFA',
                      borderRadius: 10, padding: '10px 14px', gap: 10,
                      opacity: t.isActive ? 1 : 0.55,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: t.isActive ? '#EDE9FE' : '#F3F4F6',
                          color: t.isActive ? '#4429A6' : '#9CA3AF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {t.order}
                        </span>
                        <span style={{
                          fontSize: 13, fontWeight: 600, color: '#0F1026',
                          textDecoration: t.isActive ? 'none' : 'line-through',
                        }}>
                          {t.taskName}
                        </span>
                        {!t.isActive && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, background: '#F3F4F6', color: '#6B7280',
                            padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                          }}>
                            INACTIVA
                          </span>
                        )}
                      </div>
                      <TareaActions id={t.id} taskName={t.taskName} isActive={t.isActive} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p style={{ fontSize: 12, color: '#BBBBBB', marginTop: 24, lineHeight: 1.6 }}>
        Editar una plantilla no altera las revisiones ya creadas: cada revisión guarda su propia copia
        del checklist en el momento en que se crea.
      </p>
    </div>
  )
}
