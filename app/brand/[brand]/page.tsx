import { prisma } from '@/lib/prisma'
import ManualCard from '@/components/ManualCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ brand: string }>
}

interface Manual {
  id: number
  title: string
  carBrand: string
  fileLink: string
  uploader: {
    name: string
  }
}

export default async function BrandPage({ params }: PageProps) {
  const { brand: brandParam } = await params
const brand = brandParam.charAt(0).toUpperCase() + brandParam.slice(1)
  
  const manuals = await prisma.manual.findMany({
    where: {
      carBrand: {
        contains: brand,
        mode: 'insensitive'
      }
    },
    include: {
      uploader: true
    }
  })

  if (manuals.length === 0) {
    notFound()
  }

  const models = manuals.reduce<Record<string, Manual[]>>((acc, manual) => {
    const model = manual.carBrand.replace(brand, '').trim()
    if (!acc[model]) {
      acc[model] = []
    }
    acc[model].push(manual)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-8">
        <Link href="/" className="text-black hover:underline mb-4 inline-block">
          ← Назад
        </Link>
        <h1 className="text-3xl font-bold">{brand}</h1>
        <p className="text-black-600 mt-2">
          Найдено руководств: {manuals.length} 
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(models).map(([model, modelManuals]) => (
          <div key={model}>
            <h2 className="text-2xl font-bold mb-4">{model}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelManuals.map((manual: Manual) => (
                <ManualCard key={manual.id} manual={manual} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}