import { supabase } from '../lib/supabase';
import { Product, Transaction, User } from '../types';

export class DatabaseService {
  // Product Operations
  static async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        manufacturer_id: product.manufacturer,
        current_owner_id: product.manufacturer,
        current_owner_type: 'manufacturer',
        status: 'manufactured',
        price: product.price,
        retail_price: product.retailPrice,
        quality_score: product.quality,
        temperature: product.temperature,
        humidity: product.humidity,
        location: product.currentLocation,
        batch_size: product.batchSize,
        minimum_order: product.minimumOrderQuantity
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create product: ${error.message}`);
    return this.mapProductFromDB(data);
  }

  static async updateProductStatus(
    productId: string,
    status: string,
    newOwnerId: string,
    ownerType: string
  ): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        status,
        current_owner_id: newOwnerId,
        current_owner_type: ownerType
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update product status: ${error.message}`);
    return this.mapProductFromDB(data);
  }

  static async createInspection(
    productId: string,
    inspectorId: string,
    inspectorType: string,
    inspectionData: {
      status: string;
      notes: string;
      temperature: number;
      humidity: number;
      quality_score: number;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('inspections')
      .insert([{
        product_id: productId,
        inspector_id: inspectorId,
        inspector_type: inspectorType,
        ...inspectionData
      }]);

    if (error) throw new Error(`Failed to create inspection: ${error.message}`);
  }

  static async createTransaction(
    productId: string,
    fromId: string,
    fromType: string,
    toId: string,
    toType: string,
    action: string,
    amount?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .insert([{
        product_id: productId,
        from_id: fromId,
        from_type: fromType,
        to_id: toId,
        to_type: toType,
        action,
        amount
      }]);

    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
  }

  static async updatePriceHistory(
    productId: string,
    price: number
  ): Promise<void> {
    const { error } = await supabase
      .from('price_history')
      .insert([{
        product_id: productId,
        price
      }]);

    if (error) throw new Error(`Failed to update price history: ${error.message}`);
  }

  static async getProductTransactions(productId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get transactions: ${error.message}`);
    return data.map(this.mapTransactionFromDB);
  }

  static async getPriceHistory(productId: string): Promise<Array<{ timestamp: number; price: number }>> {
    const { data, error } = await supabase
      .from('price_history')
      .select('timestamp, price')
      .eq('product_id', productId)
      .order('timestamp', { ascending: true });

    if (error) throw new Error(`Failed to get price history: ${error.message}`);
    return data.map(item => ({
      timestamp: new Date(item.timestamp).getTime(),
      price: item.price
    }));
  }

  // Helper methods to map database objects to application types
  private static mapProductFromDB(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      manufacturer: data.manufacturer_id,
      currentLocation: data.location,
      status: data.status,
      timestamp: new Date(data.created_at).getTime(),
      transactionHash: data.id, // Using ID as transaction hash for now
      price: data.price,
      paymentStatus: 'pending',
      estimatedDelivery: new Date(data.created_at).getTime() + (7 * 24 * 60 * 60 * 1000),
      coordinates: {
        lat: 0, // These would come from a separate location tracking system
        lng: 0
      },
      route: [], // This would be calculated based on shipping routes
      quality: data.quality_score,
      temperature: data.temperature,
      humidity: data.humidity,
      inspectionStatus: 'pending',
      retailPrice: data.retail_price,
      priceHistory: [], // This would be populated separately
      marketAnalysis: {
        volatility: 0,
        trend: 'neutral',
        volume: 0
      },
      distributorMargin: 15,
      batchSize: data.batch_size,
      minimumOrderQuantity: data.minimum_order,
      certifications: ['ISO 9001', 'GMP', 'HACCP'],
      sustainabilityScore: 85
    };
  }

  private static mapTransactionFromDB(data: any): Transaction {
    return {
      hash: data.id,
      from: data.from_id,
      to: data.to_id,
      productId: data.product_id,
      action: data.action,
      timestamp: new Date(data.created_at).getTime(),
      amount: data.amount,
      paymentStatus: data.status
    };
  }
}