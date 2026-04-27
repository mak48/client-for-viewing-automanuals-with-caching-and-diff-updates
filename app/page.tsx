import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ManualCard from '@/components/ManualCard'

export const revalidate = 3600

export default async function Home() {
  const carBrands = [
    { name: 'Acura' },
    { name: 'Alfa Romeo' },
    { name: 'Aston Martin' },
    { name: 'Audi' },
    { name: 'BMW' },
    { name: 'BYD' },
    { name: 'Bugatti' },
    { name: 'Cadillac' },
    { name: 'Chevrolet' },
    { name: 'Citroen' },
    { name: 'DAF' },
    { name: 'Dacia' },
    { name: 'Dodge' },
    { name: 'FAW' },
    { name: 'Ferrari' },
    { name: 'Fiat' },
    { name: 'Ford' },
    { name: 'Foton' },
    { name: 'GMC' },
    { name: 'Genesis' },
    { name: 'Haval' },
    { name: 'Honda' },
    { name: 'Hyundai' },
    { name: 'Infiniti' },
    { name: 'Isuzu' },
    { name: 'JAC' },
    { name: 'Jaguar' },
    { name: 'Jeep' },
    { name: 'Kia' },
    { name: 'Lada' },
    { name: 'Lamborghini' },
    { name: 'Land Rover' },
    { name: 'Lexus' },
    { name: 'Lincoln' },
    { name: 'MAN' },
    { name: 'Mazda' },
    { name: 'McLaren' },
    { name: 'Mercedes-Benz' },
    { name: 'Nissan' },
    { name: 'Opel' },
    { name: 'Peterbilt' },
    { name: 'Peugeot' },
    { name: 'Porsche' },
    { name: 'Renault' },
    { name: 'Rivian' },
    { name: 'SEAT' },
    { name: 'Scania' },
    { name: 'Skoda' },
    { name: 'Subaru' },
    { name: 'Suzuki' },
    { name: 'Tesla' },
    { name: 'Toyota' },
    { name: 'Volkswagen' },
    { name: 'Volvo' },
    { name: 'Другое' }
  ]

  const brandCounts = await Promise.all(
    carBrands.map(async (brand) => {
      const count = await prisma.manual.count({
        where: {
          carBrand: {
            contains: brand.name,
            mode: 'insensitive'
          }
        }
      })
      return { ...brand, count }
    })
  )

  const recentManuals = await prisma.manual.findMany({
    take: 3,
    orderBy: { id: 'desc' },
    include: { uploader: true }
  })

  return (
    <div>
      
      <section className="text-center mb-12 pt-8">
        <h1 className="text-4xl font-bold mb-4">
          Инструкции и руководства
        </h1>
        <p className="text-xl text-gray-600">
          по эксплуатации, техническому обслуживанию и ремонту автомобилей
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Недавно добавленные</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentManuals.map((manual) => (
            <ManualCard key={manual.id} manual={manual} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Популярные марки</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {brandCounts.map((brand) => (
            <Link
              key={brand.name}
              href={`/brand/${brand.name.toLowerCase()}`}
              className="card text-center hover:scale-105 transform transition-transform"
            >
              <h3 className="text-xl font-semibold">{brand.name}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {brand.count > 0 
                  ? `руководств: ${brand.count}` 
                  : 'Добавьте руководство'}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}