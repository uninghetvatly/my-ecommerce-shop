import ProductFeed from "../components/ProductFeed"

export default function Home() {
  return (
    <div className="bg-slate-50/50">
      <main className="container mx-auto px-4 py-8 pb-20">
        <ProductFeed />
      </main>
    </div>
  )
}