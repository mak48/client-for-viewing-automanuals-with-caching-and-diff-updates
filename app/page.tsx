import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ManualCard from '@/components/ManualCard'
import { CAR_BRANDS } from '@/lib/carBrands'

export const revalidate = 3600

export default async function Home() {
  const carBrands = CAR_BRANDS.map(name => ({ name }))
  
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
  <div
    className="rounded-2xl mb-8 px-8 py-10 relative overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #712B13 0%, #D85A30 60%, #FAECE7 100%)' }}
  >
    <div className="relative z-10 max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
        Инструкции и руководства<br />
        <span className="text-white/75">по эксплуатации, техническому</span><br />
        <span className="text-white/75">обслуживанию и ремонту автомобилей</span>
      </h1>
      <p className="text-white/70 text-sm mt-4 max-w-lg">
        Изучите руководства, инструкции и документации по ремонту для множества марок и моделей.
      </p>
    </div>
    <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full opacity-10" style={{ background: '#fff' }} />
    <div className="absolute -right-4 bottom-0 w-40 h-40 rounded-full opacity-10" style={{ background: '#fff' }} />
  </div>

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