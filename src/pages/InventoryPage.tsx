import { useState, useEffect, useCallback } from 'react'
import { Package, Plus, Edit2, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchBar from '@/components/ui/SearchBar'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import ProductForm from '@/components/inventory/ProductForm'
import { getDataLayer } from '@/lib/dataLayer'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

const CATEGORY_FILTER = [
  { value: '', label: 'All Categories' },
  { value: 'Grains', label: 'Grains' },
  { value: 'Essentials', label: 'Essentials' },
  { value: 'Oils', label: 'Oils' },
  { value: 'Snacks', label: 'Snacks' },
  { value: 'Personal Care', label: 'Personal Care' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Dairy', label: 'Dairy' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Other', label: 'Other' },
]

const STOCK_FILTER = [
  { value: '', label: 'All Stock' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
]

function getStockBadge(product: Product) {
  if (product.current_stock === 0)
    return <Badge variant="danger">Out of Stock</Badge>
  if (product.current_stock <= product.min_stock_level)
    return <Badge variant="warning">Low Stock</Badge>
  return <Badge variant="success">In Stock</Badge>
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setProducts(await getDataLayer().getProducts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !categoryFilter || p.category === categoryFilter
    const matchStock =
      !stockFilter ||
      (stockFilter === 'out' && p.current_stock === 0) ||
      (stockFilter === 'low' && p.current_stock > 0 && p.current_stock <= p.min_stock_level)
    return matchSearch && matchCat && matchStock
  })

  const totalValue = products.reduce((s, p) => s + p.current_stock * p.purchase_price, 0)

  const handleDelete = async () => {
    if (!deleteProduct) return
    setDeleting(true)
    try {
      await getDataLayer().deleteProduct(deleteProduct.id)
      setDeleteProduct(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} products &nbsp;·&nbsp; Total value:{' '}
            <span className="font-semibold text-indigo-600">{formatCurrency(totalValue)}</span>
          </p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
          className="w-64"
        />
        <Select
          options={CATEGORY_FILTER}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-44"
        />
        <Select
          options={STOCK_FILTER}
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="w-44"
        />
      </div>

      {/* Desktop table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-7 h-7" />}
          title="No products found"
          description="Add your first product or adjust your filters."
          action={{ label: 'Add Product', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Buy Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Sell Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock Value</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-gray-900">{p.current_stock}</span>
                      <span className="text-gray-400 text-xs ml-1">{p.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{getStockBadge(p)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(p.purchase_price)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(p.selling_price)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(p.current_stock * p.purchase_price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProduct(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                  </div>
                  {getStockBadge(p)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div>
                    <p>Stock</p>
                    <p className="font-semibold text-gray-900">{p.current_stock} {p.unit}</p>
                  </div>
                  <div>
                    <p>Buy / Sell</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(p.purchase_price)} / {formatCurrency(p.selling_price)}</p>
                  </div>
                  <div>
                    <p>Value</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(p.current_stock * p.purchase_price)}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => setEditProduct(p)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => setDeleteProduct(p)}
                    className="flex-1 text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Product" size="lg">
        <ProductForm
          onSaved={() => { setAddOpen(false); load() }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Edit Product"
        size="lg"
      >
        {editProduct && (
          <ProductForm
            product={editProduct}
            onSaved={() => { setEditProduct(null); load() }}
            onCancel={() => setEditProduct(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="Delete Product"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteProduct(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{deleteProduct?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
