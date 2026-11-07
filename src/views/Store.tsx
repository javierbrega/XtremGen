"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../lib/motion';
import { ShoppingCart, Star, Plus, X } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Base';
import { useFilter } from '../context/FilterContext';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const StorePage = () => {
  const { activeFilter } = useFilter();
  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('59.99');
  const [category, setCategory] = useState('Periféricos');
  const [platform, setPlatform] = useState('pc');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('store_products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = activeFilter
    ? products.filter((p) => p.platform?.toLowerCase() === activeFilter.toLowerCase())
    : products;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('store_products').insert({
      seller_id: user.id,
      title: title.trim(),
      price: parseFloat(price) || 0,
      category,
      platform,
      image_url:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
    });
    setIsSubmitting(false);

    if (error) {
      showNotification({
        title: 'Error',
        message: error.message || 'No se pudo publicar el producto.',
        type: 'error',
      });
    } else {
      setTitle('');
      setImageUrl('');
      setIsModalOpen(false);
      fetchProducts();
      showNotification({
        title: '¡Producto Añadido!',
        message: 'El ítem ya está disponible en la Tienda XG.',
        type: 'success',
      });
    }
  };

  return (
    <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black mb-3 flex items-center gap-4">
            <ShoppingCart className="text-primary w-10 h-10 md:w-14 md:h-14" />
            TIENDA <span className="text-primary">XG</span>
            {activeFilter && (
              <Badge variant="primary" className="text-xl py-1 px-4 ml-2 uppercase">
                {activeFilter}
              </Badge>
            )}
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl">
            Equípate con el mejor hardware, periféricos y merchandising oficial de XtremGen.
          </p>
        </div>

        <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
          <Plus className="w-4 h-4" />
          Publicar Producto
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-white/10 bg-[#121218]/60">
          <ShoppingCart className="w-16 h-16 text-primary/60 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Tienda XG en 0</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Se eliminaron los productos hardcodeados. Publica el primer periférico, drop o accesorio oficial.
          </p>
          <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
            <Plus className="w-4 h-4" />
            Añadir Primer Producto
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden group flex flex-col h-full">
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="primary">{product.category}</Badge>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-zinc-400">{product.rating || 5.0}</span>
                  </div>
                  <h3 className="font-bold text-white mb-3 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-black text-white">${product.price}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        showNotification({
                          title: 'Añadido al carrito',
                          message: `${product.title} listo para checkout.`,
                          type: 'success',
                        })
                      }
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e0e14] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-black uppercase text-white">Añadir Producto a Tienda</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: XG Pro Gaming Mouse"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Precio (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value="Periféricos">Periféricos</option>
                    <option value="Audio">Audio</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Merch">Merch</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Plataforma</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value="pc">PC</option>
                    <option value="ps">PlayStation</option>
                    <option value="xbox">Xbox</option>
                    <option value="nintendo">Nintendo</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Imagen URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Guardar Producto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
