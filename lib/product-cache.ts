/**
 * Product cache utilities for the optimized top3 cache
 */

export interface PrintifyProduct {
  id: number
  title: string
  category: string
  decoration_methods: string[]
  is_printify_choice: boolean
  is_youth_appropriate: boolean
  popularity_score: number
  blueprint_id?: number
  print_areas?: PrintArea[]
  primary_print_provider_id?: number
  variants: ProductVariant[]
  print_providers: number[]
  available: boolean
  tags?: string[]
}

export interface ProductVariant {
  id: number
  color: string
  size: string
  available: boolean
  price?: number
}

export interface PrintArea {
  position: string
  max_width?: number
  max_height?: number
  width?: number
  height?: number
}

export interface ProductCache {
  version: string
  last_update: string
  optimization_info: {
    source: string
    original_products: number
    optimized_products: number
    categories_included: number
    space_reduction: string
    selection_criteria: string
  }
  category_info: {
    [category: string]: {
      total_available: number
      top3_selected: number
      avg_popularity: number
    }
  }
  providers: {
    [id: string]: string
  }
  products: {
    [id: string]: PrintifyProduct
  }
}

class ProductCacheService {
  private cache: ProductCache | null = null
  private cacheLoaded = false

  async loadCache(): Promise<ProductCache> {
    if (this.cacheLoaded && this.cache) {
      return this.cache
    }

    try {
      // In production, this would be served from a CDN or API
      const response = await fetch('/top3_product_cache_optimized.json')
      
      if (!response.ok) {
        throw new Error(`Failed to load cache: ${response.statusText}`)
      }
      
      this.cache = await response.json() as ProductCache
      this.cacheLoaded = true
      
      console.log(`📦 Loaded product cache: ${this.cache.optimization_info.optimized_products} products`)
      
      return this.cache
    } catch (error) {
      console.error('Failed to load product cache:', error)
      throw error
    }
  }

  async getAllProducts(): Promise<PrintifyProduct[]> {
    const cache = await this.loadCache()
    return Object.values(cache.products)
  }

  async getProductsByCategory(category: string): Promise<PrintifyProduct[]> {
    const cache = await this.loadCache()
    return Object.values(cache.products).filter(
      product => product.category.toLowerCase() === category.toLowerCase()
    )
  }

  async getProductById(id: string): Promise<PrintifyProduct | null> {
    const cache = await this.loadCache()
    return cache.products[id] || null
  }

  async getAvailableCategories(): Promise<string[]> {
    const cache = await this.loadCache()
    return Object.keys(cache.category_info)
  }

  async getColorsForProduct(productId: string): Promise<string[]> {
    const product = await this.getProductById(productId)
    if (!product) return []

    const colors = new Set<string>()
    product.variants.forEach(variant => {
      if (variant.available && variant.color) {
        colors.add(variant.color)
      }
    })

    return Array.from(colors).sort()
  }

  async getSizesForProduct(productId: string): Promise<string[]> {
    const product = await this.getProductById(productId)
    if (!product) return []

    const sizes = new Set<string>()
    product.variants.forEach(variant => {
      if (variant.available && variant.size) {
        sizes.add(variant.size)
      }
    })

    // Sort sizes in logical order
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']
    const sortedSizes: string[] = []
    const remainingSizes = Array.from(sizes)

    sizeOrder.forEach(size => {
      if (remainingSizes.includes(size)) {
        sortedSizes.push(size)
        remainingSizes.splice(remainingSizes.indexOf(size), 1)
      }
    })

    // Add any remaining sizes
    sortedSizes.push(...remainingSizes.sort())

    return sortedSizes
  }

  async findVariant(productId: string, color: string, size: string): Promise<ProductVariant | null> {
    const product = await this.getProductById(productId)
    if (!product) return null

    return product.variants.find(variant => 
      variant.available &&
      variant.color.toLowerCase() === color.toLowerCase() &&
      variant.size.toLowerCase() === size.toLowerCase()
    ) || null
  }

  async getProviderName(providerId: number): Promise<string> {
    const cache = await this.loadCache()
    return cache.providers[providerId.toString()] || `Provider ${providerId}`
  }

  // Color categorization utilities
  categorizeColors(colors: string[]): { [family: string]: string[] } {
    const colorFamilies = {
      red: ['red', 'cherry', 'cardinal', 'maroon', 'burgundy', 'crimson'],
      blue: ['blue', 'navy', 'royal', 'carolina', 'sapphire', 'azure'],
      green: ['green', 'forest', 'kelly', 'irish', 'lime', 'emerald'],
      black: ['black', 'charcoal', 'ash'],
      white: ['white', 'cream', 'ivory', 'pearl'],
      gray: ['gray', 'grey', 'heather', 'athletic heather', 'sport grey'],
      yellow: ['yellow', 'gold', 'maize', 'banana'],
      orange: ['orange', 'burnt orange', 'autumn'],
      purple: ['purple', 'violet', 'lavender', 'plum'],
      pink: ['pink', 'rose', 'magenta', 'hot pink']
    }

    const categorized: { [family: string]: string[] } = {}
    const other: string[] = []

    colors.forEach(color => {
      const colorLower = color.toLowerCase()
      let familyFound = false

      for (const [family, keywords] of Object.entries(colorFamilies)) {
        if (keywords.some(keyword => colorLower.includes(keyword))) {
          if (!categorized[family]) categorized[family] = []
          categorized[family].push(color)
          familyFound = true
          break
        }
      }

      if (!familyFound) {
        other.push(color)
      }
    })

    if (other.length > 0) {
      categorized.other = other
    }

    return categorized
  }

  suggestTeamColors(colors: string[]): string[] {
    const teamPriority = [
      'black', 'white', 'navy', 'royal', 'red', 'cardinal',
      'athletic heather', 'sport grey', 'forest green', 'purple'
    ]

    const suggestions: string[] = []
    
    teamPriority.forEach(priority => {
      const match = colors.find(color => 
        color.toLowerCase().includes(priority.toLowerCase())
      )
      if (match && !suggestions.includes(match)) {
        suggestions.push(match)
      }
    })

    return suggestions.slice(0, 6) // Return top 6
  }
}

// Export singleton instance
export const productCache = new ProductCacheService()

// Helper function to calculate pricing with markup
export function calculateSellingPrice(baseCost: number, markupPercentage: number = 50): number {
  return Math.round((baseCost * (1 + markupPercentage / 100)) * 100) / 100
}

// Helper function to get bulk discount
export function calculateBulkDiscount(quantity: number): number {
  if (quantity >= 20) return 0.15      // 15% for 20+
  if (quantity >= 10) return 0.10      // 10% for 10-19
  return 0                             // No discount for <10
}