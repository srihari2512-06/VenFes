import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs('report/figures', exist_ok=True)

# 2. CLASS DIAGRAM
fig, ax = plt.subplots(figsize=(13, 9.5), dpi=300)
ax.set_xlim(0, 13)
ax.set_ylim(0, 10)
ax.axis('off')

ax.text(6.5, 9.7, 'UML Class Diagram of Venfes Domain Entities and Relationships', 
        ha='center', va='center', fontsize=15, fontweight='bold', color='#0f172a', fontfamily='sans-serif')

def draw_class(ax, x, y, w, h, name, attrs, methods, bg='#f8fafc', border='#475569'):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.05', facecolor=bg, edgecolor=border, linewidth=1.5)
    ax.add_patch(rect)
    h_box = patches.Rectangle((x, y + h - 0.5), w, 0.5, facecolor='#334155', edgecolor=border, linewidth=1)
    ax.add_patch(h_box)
    ax.text(x + w/2, y + h - 0.25, name, ha='center', va='center', fontsize=9.5, fontweight='bold', color='white')
    
    curr_y = y + h - 0.65
    for a in attrs:
        ax.text(x + 0.1, curr_y, a, ha='left', va='center', fontsize=7.2, color='#1e293b', fontfamily='monospace')
        curr_y -= 0.24
    
    ax.plot([x, x + w], [curr_y, curr_y], color=border, lw=0.8)
    curr_y -= 0.15
    for m in methods:
        ax.text(x + 0.1, curr_y, m, ha='left', va='center', fontsize=7.2, color='#0f766e', fontfamily='monospace')
        curr_y -= 0.24

draw_class(ax, 0.5, 6.2, 2.7, 3.1, 'User', 
           ['- _id: ObjectId', '- name: String', '- email: String [UQ]', '- passwordHash: String', '- role: Enum(cust,vend,adm)', '- vendorProfile: Object', '- refreshTokens: String[]'],
           ['+ comparePassword(pwd)', '+ generateTokens()', '+ isVendorApproved()'],
           bg='#eff6ff', border='#2563eb')

draw_class(ax, 4.0, 6.0, 2.8, 3.3, 'Product',
           ['- _id: ObjectId', '- name: String [TextIdx]', '- vendorId: ObjectId [FK]', '- category: String', '- price: Number', '- stock: Number', '- variants: Variant[]', '- isPublished: Boolean', '- averageRating: Number'],
           ['+ decrementStock(qty, s)', '+ validateVariantStock()'],
           bg='#f0fdf4', border='#16a34a')

draw_class(ax, 7.5, 6.8, 2.4, 2.5, 'Variant <<Embedded>>',
           ['- _id: ObjectId', '- sku: String', '- size: String', '- color: String', '- price: Number', '- stock: Number'],
           ['+ hasStock(qty): Boolean'],
           bg='#fefce8', border='#ca8a04')

draw_class(ax, 10.3, 6.5, 2.3, 2.8, 'Cart',
           ['- _id: ObjectId', '- userId: ObjectId [FK]', '- items: CartItem[]', '- updatedAt: Date'],
           ['+ addItem(prodId, qty)', '+ removeItem(itemId)', '+ clearCart()'],
           bg='#faf5ff', border='#9333ea')

draw_class(ax, 0.5, 1.8, 2.8, 3.3, 'Order (Parent Order)',
           ['- _id: ObjectId', '- orderNumber: String [UQ]', '- customerId: ObjectId [FK]', '- subOrderIds: ObjectId[]', '- totalAmount: Number', '- paymentStatus: Enum', '- paymentMethod: String', '- shippingAddress: Object'],
           ['+ calculateTotal()', '+ updatePaymentStatus()'],
           bg='#fff1f2', border='#e11d48')

draw_class(ax, 4.0, 1.4, 3.1, 3.7, 'SubOrder',
           ['- _id: ObjectId', '- subOrderNumber: String [UQ]', '- parentOrderId: ObjectId [FK]', '- vendorId: ObjectId [FK]', '- customerId: ObjectId [FK]', '- items: OrderItem[]', '- subtotal: Number', '- commissionRate: Number', '- commissionAmount: Number', '- vendorPayoutAmount: Number', '- status: Enum(placed..delv)'],
           ['+ transitionStatus(status)', '+ calculatePayout()'],
           bg='#fff7ed', border='#ea580c')

draw_class(ax, 7.8, 1.8, 2.6, 3.2, 'PayoutLedger',
           ['- _id: ObjectId', '- vendorId: ObjectId [FK]', '- subOrderId: ObjectId [FK]', '- amount: Number', '- commission: Number', '- status: Enum(accr,sett,rev)', '- settledAt: Date', '- settledBy: ObjectId'],
           ['+ settle(adminId)', '+ reverse()'],
           bg='#ecfdf5', border='#059669')

draw_class(ax, 10.7, 2.2, 2.0, 2.8, 'Review',
           ['- _id: ObjectId', '- productId: ObjectId', '- customerId: ObjectId', '- subOrderId: ObjectId', '- rating: Number (1-5)', '- comment: String', '- isFlagged: Boolean'],
           ['+ verifyPurchase()'],
           bg='#f1f5f9', border='#64748b')

# Connectors
ax.annotate('1', xy=(3.2, 7.7), fontsize=8, fontweight='bold', color='#1e3a8a')
ax.annotate('0..*', xy=(3.9, 7.7), fontsize=8, fontweight='bold', color='#166534')
ax.annotate('', xy=(3.2, 7.6), xytext=(4.0, 7.6), arrowprops=dict(arrowstyle='<-', lw=1.5, color='#475569'))
ax.text(3.6, 7.8, 'owns', ha='center', fontsize=7.5, color='#64748b')

ax.annotate('1', xy=(6.8, 8.0), fontsize=8, fontweight='bold', color='#166534')
ax.annotate('0..*', xy=(7.4, 8.0), fontsize=8, fontweight='bold', color='#854d0e')
ax.annotate('', xy=(6.8, 7.9), xytext=(7.5, 7.9), arrowprops=dict(arrowstyle='<|-', lw=1.5, color='#475569'))
ax.text(7.15, 8.1, 'contains', ha='center', fontsize=7.5, color='#64748b')

ax.annotate('1', xy=(3.3, 3.4), fontsize=8, fontweight='bold', color='#9f1239')
ax.annotate('1..*', xy=(3.9, 3.4), fontsize=8, fontweight='bold', color='#c2410c')
ax.annotate('', xy=(3.3, 3.3), xytext=(4.0, 3.3), arrowprops=dict(arrowstyle='<|-', lw=1.5, color='#475569'))
ax.text(3.65, 3.5, 'splits into', ha='center', fontsize=7.5, color='#64748b')

ax.annotate('1', xy=(7.1, 3.4), fontsize=8, fontweight='bold', color='#c2410c')
ax.annotate('1', xy=(7.7, 3.4), fontsize=8, fontweight='bold', color='#065f46')
ax.annotate('', xy=(7.1, 3.3), xytext=(7.8, 3.3), arrowprops=dict(arrowstyle='<-', lw=1.5, color='#475569'))
ax.text(7.45, 3.5, 'accrues', ha='center', fontsize=7.5, color='#64748b')

ax.annotate('', xy=(1.8, 6.2), xytext=(1.8, 5.1), arrowprops=dict(arrowstyle='<-', lw=1.5, color='#475569'))
ax.text(2.0, 5.65, 'places\n1 to 0..*', fontsize=7.5, color='#64748b')

ax.annotate('', xy=(3.2, 8.5), xytext=(10.3, 8.5), arrowprops=dict(arrowstyle='<-', lw=1.5, color='#475569', linestyle='dashed'))
ax.text(6.5, 8.65, 'maintains (1 to 1)', ha='center', fontsize=7.5, color='#64748b')

plt.tight_layout()
plt.savefig('report/figures/class_diagram.png', dpi=300)
plt.close()
print('Class diagram generated successfully.')

# 3. SEQUENCE DIAGRAM
fig, ax = plt.subplots(figsize=(13, 9.5), dpi=300)
ax.set_xlim(0, 13)
ax.set_ylim(0, 10)
ax.axis('off')

ax.text(6.5, 9.7, 'UML Sequence Diagram: Multi-Vendor Cart-Splitting and Stock Transaction', 
        ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a', fontfamily='sans-serif')

lifelines = [
    ('Customer\n(Browser)', 1.2),
    ('Cart / Client\n(React 18)', 3.2),
    ('Express API\n(/checkout)', 5.2),
    ('CheckoutService\n(Core Engine)', 7.2),
    ('MongoDB Session\n(ACID ReplicaSet)', 9.3),
    ('Socket.io\n(Realtime Feed)', 11.5)
]

for name, x in lifelines:
    b = patches.FancyBboxPatch((x-0.9, 8.6), 1.8, 0.7, boxstyle='round,pad=0.05', facecolor='#1e293b', edgecolor='#0f172a')
    ax.add_patch(b)
    ax.text(x, 8.95, name, ha='center', va='center', fontsize=8, fontweight='bold', color='white')
    ax.plot([x, x], [0.8, 8.6], color='#94a3b8', linestyle='dashed', lw=1.2)

steps = [
    (8.1, 1.2, 3.2, '1. Click Checkout (Shipping & Cart Items)', False),
    (7.5, 3.2, 5.2, '2. POST /api/orders/checkout [Bearer JWT]', False),
    (6.9, 5.2, 7.2, '3. executeCheckout(userId, items, addr)', False),
    (6.3, 7.2, 9.3, '4. startSession() & session.startTransaction()', False),
    (5.7, 7.2, 9.3, '5. Group items by vendorId; Validate Variants & Stock', False),
    (5.1, 9.3, 7.2, '6. Stock confirmed for all vendors (Atomic check)', True),
    (4.5, 7.2, 9.3, '7. Decrement stock per variant/product in session', False),
    (3.9, 7.2, 9.3, '8. Create Parent Order & N SubOrders with Commissions', False),
    (3.3, 7.2, 9.3, '9. Create PayoutLedgers & Clear User Cart in session', False),
    (2.7, 7.2, 9.3, '10. commitTransaction() & endSession()', False),
    (2.1, 7.2, 11.5, '11. emit("order:placed", { subOrders, parentOrder })', False),
    (1.5, 7.2, 5.2, '12. Return { success: true, order, subOrders }', True),
    (1.0, 5.2, 3.2, '13. HTTP 201 Created (Order Breakdown)', True),
    (0.5, 3.2, 1.2, '14. Render Order Confirmation & Multi-Vendor Tracking', True)
]

for y, x1, x2, msg, is_return in steps:
    color = '#2563eb' if not is_return else '#059669'
    ax.annotate('', xy=(x2, y), xytext=(x1, y), 
                arrowprops=dict(arrowstyle='->', linestyle='dashed' if is_return else 'solid', lw=1.5, color=color))
    mid_x = (x1 + x2) / 2
    ax.text(mid_x, y + 0.14, msg, ha='center', va='bottom', fontsize=7.6, fontweight='bold', color='#1e293b')

plt.tight_layout()
plt.savefig('report/figures/sequence_diagram.png', dpi=300)
plt.close()
print('Sequence diagram generated successfully.')
