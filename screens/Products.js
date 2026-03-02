import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';

const initialProducts = [
  { id: '1', name: 'Premium Laptop', image: '💻', price: '$1,299', category: 'Electronics', stock: 15, sold: 87, rating: 4.8, topSeller: true, customer: 'TechCorp Inc.', description: 'High-performance business laptop with 16GB RAM, 512GB SSD.', specs: 'Intel i7, 16GB RAM, 512GB SSD, 15.6" FHD' },
  { id: '2', name: 'Wireless Headphones', image: '🎧', price: '$199', category: 'Audio', stock: 42, sold: 234, rating: 4.6, topSeller: true, customer: 'AudioMax', description: 'Noise-cancelling Bluetooth headphones with 30hr battery.', specs: 'Bluetooth 5.0, ANC, 30hr battery' },
  { id: '3', name: 'Smartphone', image: '📱', price: '$899', category: 'Electronics', stock: 28, sold: 156, rating: 4.7, topSeller: true, customer: 'MobileHub', description: 'Latest flagship with 5G, 128GB storage, AMOLED display.', specs: '5G, 128GB, AMOLED, Dual Camera' },
  { id: '4', name: 'Tablet Pro', image: '📱', price: '$599', category: 'Electronics', stock: 12, sold: 65, rating: 4.5, topSeller: false, customer: 'DeviceWorld', description: 'Powerful tablet perfect for work and entertainment.', specs: '11" LCD, 256GB, Stylus support' },
  { id: '5', name: 'USB-C Cable', image: '🔌', price: '$29', category: 'Accessories', stock: 189, sold: 542, rating: 4.9, topSeller: true, customer: 'CableSupply Co.', description: 'Fast charging USB-C cable 3m long, certified.', specs: '3m, 100W, Certified' },
  { id: '6', name: 'Mechanical Keyboard', image: '⌨️', price: '$149', category: 'Peripherals', stock: 34, sold: 128, rating: 4.7, topSeller: false, customer: 'KeyMaster Store', description: 'RGB mechanical keyboard with tactile switches.', specs: 'RGB, Mechanical switches, USB' },
  { id: '7', name: 'Monitor 4K', image: '🖥️', price: '$399', category: 'Electronics', stock: 8, sold: 42, rating: 4.6, topSeller: false, customer: 'DisplayPro', description: '27" 4K monitor with USB-C and speakers.', specs: '27" 4K, 60Hz, USB-C, Speakers' },
  { id: '8', name: 'Webcam HD', image: '📹', price: '$89', category: 'Accessories', stock: 56, sold: 213, rating: 4.5, topSeller: false, customer: 'VideoTech', description: 'Full HD webcam with auto focus and noise reduction.', specs: '1080p, Auto-focus, Noise-cancel' },
  { id: '9', name: 'Organic Rice (5kg)', image: '🍚', price: '$24', category: 'Food', stock: 128, sold: 587, rating: 4.8, topSeller: true, customer: 'FreshFarm Supplies', description: 'Premium organic basmati rice, pesticide-free, sustainably grown.', specs: '5kg bag, Organic, Non-GMO, Long grain' },
  { id: '10', name: 'Extra Virgin Olive Oil', image: '🫒', price: '$18', category: 'Food', stock: 95, sold: 432, rating: 4.7, topSeller: true, customer: 'Mediterranean Foods', description: 'Cold-pressed extra virgin olive oil from Greece, 500ml bottle.', specs: '500ml, Cold-pressed, First extraction' },
  { id: '11', name: 'Whole Wheat Flour (10kg)', image: '🌾', price: '$22', category: 'Food', stock: 67, sold: 341, rating: 4.6, topSeller: false, customer: 'Grain Mills Ltd', description: 'High-protein whole wheat flour, perfect for baking and cooking.', specs: '10kg bag, Whole grain, High protein' },
  { id: '12', name: 'Honey Raw (1kg)', image: '🍯', price: '$32', category: 'Food', stock: 43, sold: 289, rating: 4.9, topSeller: true, customer: 'Beehive Naturals', description: 'Raw unfiltered honey with natural enzymes and nutrients.', specs: '1kg jar, Raw, Unfiltered, 100% pure' },
  { id: '13', name: 'Coffee Beans Premium', image: '☕', price: '$28', category: 'Food', stock: 54, sold: 423, rating: 4.7, topSeller: true, customer: 'Brew Masters', description: 'Single-origin Arabica coffee beans from Brazil, 1kg bag.', specs: '1kg, Arabica, Medium roast, Fresh' },
  { id: '14', name: 'Steel Nails (1kg)', image: '🔨', price: '$12', category: 'Materials', stock: 245, sold: 1203, rating: 4.5, topSeller: false, customer: 'BuildCore Materials', description: 'High-grade steel nails, various sizes, corrosion-resistant.', specs: '1kg assorted, Steel, Galvanized' },
  { id: '15', name: 'Cement Bag (50kg)', image: '🏗️', price: '$8', category: 'Materials', stock: 120, sold: 876, rating: 4.6, topSeller: false, customer: 'ConstructionPro Supply', description: 'Portland cement for construction and repairs, 50kg bag.', specs: '50kg bag, Portland type, Grade 53' },
  { id: '16', name: 'Plywood Sheet 4x8', image: '🪵', price: '$45', category: 'Materials', stock: 32, sold: 156, rating: 4.5, topSeller: false, customer: 'Timber Depot', description: 'Premium plywood sheets, smooth finish, excellent durability.', specs: '4x8 ft, 3/4" thick, Grade A' },
  { id: '17', name: 'Paint 5L (White)', image: '🎨', price: '$35', category: 'Materials', stock: 67, sold: 234, rating: 4.7, topSeller: false, customer: 'Color Works', description: 'High-quality interior paint, 5L bucket, smooth coverage.', specs: '5L bucket, Acrylic, Water-based' },
  { id: '18', name: 'Stainless Steel Bolts', image: '⚙️', price: '$16', category: 'Materials', stock: 189, sold: 612, rating: 4.6, topSeller: false, customer: 'Fastener Hub', description: 'Grade 8 stainless steel bolts assortment, corrosion-proof.', specs: 'Mixed sizes, SS 304, M6-M12' },
  { id: '19', name: 'Organic Tomatoes (2kg)', image: '🍅', price: '$14', category: 'Food', stock: 78, sold: 521, rating: 4.8, topSeller: false, customer: 'Fresh Valley Farm', description: 'Fresh organic tomatoes, picked daily, farm-to-table.', specs: '2kg box, Organic, Vine-ripened' },
  { id: '20', name: 'Pasta Variety Pack', image: '🍝', price: '$11', category: 'Food', stock: 156, sold: 743, rating: 4.6, topSeller: false, customer: 'Italian Foods Co', description: 'Assorted premium pasta shapes, 2kg total, made in Italy.', specs: '2kg box, Durum wheat, Multiple shapes' },
  { id: '21', name: 'Sea Salt (500g)', image: '🧂', price: '$9', category: 'Food', stock: 234, sold: 876, rating: 4.7, topSeller: true, customer: 'Sea Harvests', description: 'Fine sea salt, mineral-rich, perfect for cooking and seasoning.', specs: '500g pouch, Natural, Iodized' },
  { id: '22', name: 'Dark Chocolate Bar', image: '🍫', price: '$6', category: 'Food', stock: 312, sold: 1456, rating: 4.8, topSeller: true, customer: 'Cocoa Delights', description: '85% dark chocolate, fair-trade, rich and smooth.', specs: '100g bar, 85% cocoa, Fair-trade' },
  { id: '23', name: 'Copper Wire (1km)', image: '🔌', price: '$42', category: 'Materials', stock: 28, sold: 87, rating: 4.6, topSeller: false, customer: 'Electrical Supply', description: 'Pure copper electrical wire, 2.5mm diameter, flexible.', specs: '1km coil, 99.9% pure, 2.5mm' },
  { id: '24', name: 'Almonds (500g)', image: '🌰', price: '$19', category: 'Food', stock: 89, sold: 412, rating: 4.8, topSeller: true, customer: 'Nut Gallery', description: 'Raw unsalted almonds from California, premium quality.', specs: '500g bag, Raw, Unsalted, Natural' },
  { id: '25', name: 'Espresso Roast Coffee', image: '☕', price: '$22', category: 'Food', stock: 67, sold: 378, rating: 4.8, topSeller: true, customer: 'Dark Brew Co', description: 'Bold espresso roast, 1kg bag, perfect for espresso machines.', specs: '1kg, Espresso roast, Dark, Bold & intense' },
  { id: '26', name: 'Vanilla Latte Mix', image: '☕', price: '$15', category: 'Food', stock: 102, sold: 267, rating: 4.6, topSeller: false, customer: 'Coffee Blends Inc', description: 'Ready-mix vanilla latte, just add hot water or milk.', specs: '500g bag, Instant mix, Vanilla flavor' },
  { id: '27', name: 'Cold Brew Coffee (32oz)', image: '☕', price: '$12', category: 'Food', stock: 145, sold: 523, rating: 4.7, topSeller: true, customer: 'Brew Masters', description: 'Chilled cold brew concentrate, ready to drink, 32oz bottle.', specs: '32oz bottle, Cold brew, Ready-to-drink' },
  { id: '28', name: 'Cappuccino Coffee Beans (1kg)', image: '☕', price: '$26', category: 'Food', stock: 54, sold: 289, rating: 4.7, topSeller: false, customer: 'Premium Roasters', description: 'Medium roast cappuccino beans, smooth and creamy flavor.', specs: '1kg, Cappuccino blend, Medium roast' },
  { id: '29', name: 'Decaf Coffee Beans', image: '☕', price: '$24', category: 'Food', stock: 38, sold: 156, rating: 4.5, topSeller: false, customer: 'Healthy Brews', description: '99.9% caffeine-free, full flavor retained, 1kg bag.', specs: '1kg, Decaf, 99.9% caffeine-free' },
  { id: '30', name: 'Mocha Mix Coffee', image: '☕', price: '$18', category: 'Food', stock: 78, sold: 412, rating: 4.6, topSeller: true, customer: 'Sweet Beans Co', description: 'Coffee and chocolate blend, 500g bag, instant mix.', specs: '500g, Mocha blend, Instant, Cocoa infused' },
];

export default function Products({ onBack, theme = 'light' }) {
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const colors = theme === 'dark' ? {
    background: '#071025',
    card: '#F0EDE5',
    muted: '#9AA6B2',
    text: '#E6EEF8',
    accent: '#065f46',
    positive: '#10B981',
  } : {
    background: '#F6FBFF',
    card: '#F0EDE5',
    muted: '#6B7280',
    text: '#111827',
    accent: '#065f46',
    positive: '#10B981',
  };

  const categories = ['All', 'Electronics', 'Audio', 'Accessories', 'Peripherals', 'Food', 'Materials'];

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesQuery = `${p.name} ${p.category} ${p.customer}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'All' ? true : p.category === filter;
      return matchesQuery && matchesFilter;
    });
  }, [products, query, filter]);

  const topSellers = filtered.filter(p => p.topSeller);

  const openProduct = (p) => { setSelected(p); setShow(true); };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#E6EEF8' }]}>
        <TouchableOpacity onPress={() => onBack && onBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 20, color: colors.muted }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text, flex: 1 }]}>Products</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View style={styles.searchWrap}>
              <TextInput
                placeholder="Search products..."
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                style={[styles.searchInput, { backgroundColor: theme === 'dark' ? '#051424' : '#F3F4F6', color: colors.text }]}
              />
            </View>

            <View style={[styles.filterWrap, { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap' }]}>
              {categories.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setFilter(cat)} style={[styles.chip, { backgroundColor: filter === cat ? colors.accent : (theme === 'dark' ? '#071428' : '#F3F4F6') }]}>
                  <Text style={{ color: filter === cat ? '#fff' : colors.muted, fontWeight: filter === cat ? '700' : '600', fontSize: 13 }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {topSellers.length > 0 && (
              <View style={styles.sectionWrap}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🔥 Top Sellers</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}>
                  {topSellers.map(p => (
                    <TouchableOpacity key={p.id} onPress={() => openProduct(p)} style={[styles.topSellerCard, { backgroundColor: colors.card, borderColor: colors.accent }]}>
                      <Text style={styles.largeEmoji}>{p.image}</Text>
                      <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                      <Text style={[styles.cardPrice, { color: colors.accent }]}>{p.price}</Text>
                      <Text style={[styles.soldBadge, { color: colors.positive }]}>{p.sold} sold</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.productCard, { backgroundColor: colors.card, borderColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#E6EEF8', marginHorizontal: 20 }]}
            onPress={() => openProduct(item)}
          >
            <View style={styles.cardRow}>
              <Text style={styles.emoji}>{item.image}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.pName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.pCategory, { color: colors.muted }]}>{item.category}</Text>
                <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
                  <Text style={[styles.rating, { color: colors.muted }]}>★ {item.rating}</Text>
                  <Text style={[styles.pStock, { color: colors.muted, marginLeft: 8 }]}>In stock: {item.stock}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.pPrice, { color: colors.accent }]}>{item.price}</Text>
                {item.topSeller && <Text style={[styles.badge, { color: '#FFB86B' }]}>🔥 Top</Text>}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={show} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setShow(false)}>
          <ScrollView style={[styles.modalCard, { backgroundColor: colors.card }]}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.closeBtn} onPress={() => setShow(false)}>✕</Text>
                </View>
                <Text style={[styles.empjiDisplay, { color: colors.accent }]}>{selected.image}</Text>

                <Text style={[styles.modalTitle, { color: colors.text }]}>{selected.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
                  <Text style={[styles.rating, { color: '#FFB86B' }]}>★ {selected.rating}</Text>
                  <Text style={[styles.soldText, { color: colors.positive, marginLeft: 12 }]}>{selected.sold} sold</Text>
                </View>

                <Text style={[styles.priceDisplay, { color: colors.accent }]}>{selected.price}</Text>

                <View style={[styles.infoTable, { borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#E6EEF8' }]}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.label, { color: colors.muted }]}>Category</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{selected.category}</Text>
                  </View>
                  <View style={[styles.infoRow, { borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#E6EEF8', borderTopWidth: 1 }]}>
                    <Text style={[styles.label, { color: colors.muted }]}>Stock</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{selected.stock} units</Text>
                  </View>
                  <View style={[styles.infoRow, { borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#E6EEF8', borderTopWidth: 1 }]}>
                    <Text style={[styles.label, { color: colors.muted }]}>Seller</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{selected.customer}</Text>
                  </View>
                  <View style={[styles.infoRow, { borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#E6EEF8', borderTopWidth: 1 }]}>
                    <Text style={[styles.label, { color: colors.muted }]}>Specifications</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{selected.specs}</Text>
                  </View>
                </View>

                <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 16 }]}>Description</Text>
                <Text style={[styles.description, { color: colors.muted }]}>{selected.description}</Text>

                <View style={{ flexDirection: 'row', marginTop: 16, marginBottom: 32 }}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent, flex: 1 }]}>
                    <Text style={styles.actionTextPrimary}>Add to Cart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme === 'dark' ? '#071428' : '#F3F4F6', marginLeft: 12, flex: 1 }]}>
                    <Text style={[styles.actionTextSecondary, { color: colors.muted }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  backBtn: { padding: 6 },
  title: { fontSize: 20, fontWeight: '800' },
  searchWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  searchInput: { padding: 12, borderRadius: 12, fontSize: 14 },
  filterWrap: { marginTop: 4, paddingVertical: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  sectionWrap: { marginTop: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', paddingHorizontal: 20, marginBottom: 8 },
  topSellerCard: { width: 140, height: 160, borderRadius: 14, borderWidth: 2, padding: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  largeEmoji: { fontSize: 48, marginBottom: 8 },
  emoji: { fontSize: 36 },
  cardName: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  cardPrice: { fontSize: 14, fontWeight: '800', marginTop: 6 },
  soldBadge: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  productCard: { padding: 14, borderRadius: 14, marginBottom: 12, marginTop: 12, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  pName: { fontSize: 16, fontWeight: '700' },
  pCategory: { fontSize: 12, marginTop: 2 },
  pPrice: { fontSize: 16, fontWeight: '800' },
  pStock: { fontSize: 12 },
  rating: { fontSize: 13, fontWeight: '600' },
  badge: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  closeBtn: { fontSize: 20, fontWeight: '700', padding: 4 },
  empjiDisplay: { fontSize: 64, textAlign: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  priceDisplay: { fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 12 },
  soldText: { fontSize: 14, fontWeight: '600' },
  infoTable: { borderTopWidth: 1, marginTop: 12 },
  infoRow: { paddingVertical: 10 },
  label: { fontSize: 13, fontWeight: '600' },
  value: { fontSize: 13, marginTop: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginTop: 12 },
  description: { fontSize: 13, marginTop: 8, lineHeight: 20 },
  actionBtn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  actionTextPrimary: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  actionTextSecondary: { fontWeight: '700', textAlign: 'center' },
});

