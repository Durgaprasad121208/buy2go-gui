import React, { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  Upload,
  Divider,
  Popconfirm,
  Empty,
  Modal,
  Badge,
  Tag,
  message,
} from 'antd';
import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  UploadOutlined,
  CheckCircleFilled,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { SubmitButton } from '../../components/app-button/AppButton';
import keychainImg from '../../assests/1cliq-keychain.jpg';
import styles from './Cart.module.css';

/* ==========================================================================
   Data Contracts & TypeScript Interfaces (API-Ready)
   ========================================================================== */

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  variant: string;
  unitPrice: number;
  quantity: number;
  image: string;
  photos: string[];
}

export interface DeliveryFormValues {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
}

export interface PlacedOrderSummary {
  orderId: string;
  placedAt: string;
  items: CartItem[];
  delivery: DeliveryFormValues;
  totalAmount: number;
  paymentMethod: string;
}

/**
 * Initial sample cart item matching user design screenshot:
 * "Customised Key Chain" / "Standard / Clear" / ₹99
 */
const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-item-kc-1',
    productId: 'keychain',
    title: 'Customised Key Chain',
    variant: 'Standard / Clear',
    unitPrice: 99,
    quantity: 1,
    image: keychainImg,
    photos: [],
  },
];

/* ==========================================================================
   Cart & Checkout Component
   ========================================================================== */

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<DeliveryFormValues>();

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>(DEFAULT_CART_ITEMS);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderSummary | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Calculations
  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  }, [cartItems]);

  // Stepper handlers
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: nextQty };
        }
        return item;
      })
    );
  };

  // Remove cart item
  const handleRemoveItem = (itemId: string) => {
    const target = cartItems.find((i) => i.id === itemId);
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    message.success(`Removed "${target?.title || 'Item'}" from cart.`);
  };

  // Add photos via Ant Design Upload
  const handleBeforeUpload = (itemId: string, file: File) => {
    const fileName = file.name;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, photos: [...item.photos, fileName] };
        }
        return item;
      })
    );
    message.success(`Attached "${fileName}" to ${cartItems.find(i => i.id === itemId)?.title}`);
    return false; // Prevent default HTTP upload POST
  };

  // Remove single uploaded photo tag
  const handleRemovePhoto = (itemId: string, photoIdx: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = [...item.photos];
          updated.splice(photoIdx, 1);
          return { ...item, photos: updated };
        }
        return item;
      })
    );
  };

  // Order Submission via Ant Design Form onFinish
  const handlePlaceOrder = async (values: DeliveryFormValues) => {
    if (cartItems.length === 0) {
      message.warning('Your cart is empty. Please add items to checkout.');
      return;
    }

    try {
      setSubmitting(true);

      // Simulate backend checkout API processing
      await new Promise((resolve) => setTimeout(resolve, 800));

      const orderResult: PlacedOrderSummary = {
        orderId: `B2G-${Math.floor(100000 + Math.random() * 900000)}`,
        placedAt: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        items: [...cartItems],
        delivery: values,
        totalAmount,
        paymentMethod: 'Cash on Delivery',
      };

      setPlacedOrder(orderResult);
      setIsSuccessModalOpen(true);
      message.success('Order placed successfully! Pay on delivery.');
    } catch {
      message.error('Failed to submit order. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
    setCartItems([]);
    form.resetFields();
    navigate('/');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Header Tag & Title */}
        <div className={styles.headerSection}>
          <span className={styles.tag}>ALMOST YOURS</span>
          <h1 className={styles.title}>CHECKOUT</h1>
        </div>

        {/* 2-Column Responsive Grid */}
        <Row gutter={[40, 32]}>
          {/* Left Column: Cart Items List */}
          <Col xs={24} lg={13} xl={14}>
            {cartItems.length === 0 ? (
              <div className={styles.emptyCartState}>
                <Empty
                  image={<ShoppingOutlined style={{ fontSize: 48, color: '#FF5E00' }} />}
                  description={<span style={{ color: '#8C867E' }}>Your cart is empty</span>}
                />
                <h3 className={styles.emptyTitle}>Looking for customized gifts?</h3>
                <p className={styles.emptySubtitle}>
                  Explore personalized acrylic key chains, mugs, caps, and tees.
                </p>
                <SubmitButton
                  onClick={() => navigate('/products')}
                >
                  Explore Products
                </SubmitButton>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className={styles.cartItemCard}>
                  {/* Thumbnail */}
                  <div className={styles.itemThumbnail}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.productImg}
                    />
                  </div>

                  {/* Item Content */}
                  <div className={styles.itemContent}>
                    {/* Title & Delete Header */}
                    <div className={styles.itemHeaderRow}>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      <Popconfirm
                        title="Remove item"
                        description="Remove this item from your cart?"
                        okText="Remove"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleRemoveItem(item.id)}
                      >
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          aria-label={`Remove ${item.title}`}
                        >
                          <DeleteOutlined style={{ fontSize: 16 }} />
                        </button>
                      </Popconfirm>
                    </div>

                    {/* Variant Subtitle */}
                    <div className={styles.itemVariant}>{item.variant}</div>

                    {/* Stepper & Price Row */}
                    <div className={styles.stepperRow}>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          className={styles.stepperBtn}
                          disabled={item.quantity <= 1}
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <MinusOutlined style={{ fontSize: 11 }} />
                        </button>
                        <span className={styles.stepperCount}>{item.quantity}</span>
                        <button
                          type="button"
                          className={styles.stepperBtn}
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <PlusOutlined style={{ fontSize: 11 }} />
                        </button>
                      </div>

                      <div className={styles.itemPrice}>
                        ₹{item.unitPrice * item.quantity}
                      </div>
                    </div>

                    {/* Upload Photos Trigger (Ant Design Upload) */}
                    <div>
                      <Upload
                        showUploadList={false}
                        multiple
                        accept="image/*,.pdf"
                        beforeUpload={(file) => handleBeforeUpload(item.id, file)}
                      >
                        <button
                          type="button"
                          className={styles.uploadTriggerBtn}
                        >
                          <UploadOutlined className={styles.uploadIcon} />
                          <span>Add your photos (logo / design)</span>
                          {item.photos.length > 0 && (
                            <Badge
                              count={item.photos.length}
                              style={{
                                backgroundColor: '#FF5E00',
                                color: '#000000',
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </button>
                      </Upload>

                      {/* Attached Photos Tag Preview */}
                      {item.photos.length > 0 && (
                        <div className={styles.photoTagsRow}>
                          {item.photos.map((photo, pIdx) => (
                            <Tag
                              key={pIdx}
                              closable
                              className={styles.photoTag}
                              onClose={() => handleRemovePhoto(item.id, pIdx)}
                            >
                              {photo}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </Col>

          {/* Right Column: Delivery Details Form & Order Breakdown */}
          <Col xs={24} lg={11} xl={10}>
            <div className={styles.deliveryCard}>
              <h2 className={styles.deliveryHeading}>DELIVERY DETAILS</h2>

              {/* Ant Design Form */}
              <Form
                form={form}
                layout="vertical"
                colon={false}
                requiredMark={false}
                onFinish={handlePlaceOrder}
              >
                {/* Full Name */}
                <Form.Item
                  name="fullName"
                  label={<span className={styles.fieldLabel}>FULL NAME</span>}
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                  className={styles.formItem}
                >
                  <Input
                    className={styles.darkInput}
                    size="large"
                    placeholder=""
                  />
                </Form.Item>

                {/* Phone / Whatsapp Number */}
                <Form.Item
                  name="phone"
                  label={
                    <span className={styles.fieldLabel}>
                      PHONE / WHATSAPP NUMBER
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please enter your phone/whatsapp number',
                    },
                    {
                      pattern: /^[0-9+\s-]{10,15}$/,
                      message: 'Please enter a valid mobile number',
                    },
                  ]}
                  className={styles.formItem}
                >
                  <Input
                    className={styles.darkInput}
                    size="large"
                    placeholder=""
                  />
                </Form.Item>

                {/* Full Address */}
                <Form.Item
                  name="address"
                  label={<span className={styles.fieldLabel}>FULL ADDRESS</span>}
                  rules={[
                    { required: true, message: 'Please enter your delivery address' },
                  ]}
                  className={styles.formItem}
                >
                  <Input
                    className={styles.darkInput}
                    size="large"
                    placeholder=""
                  />
                </Form.Item>

                {/* City */}
                <Form.Item
                  name="city"
                  label={<span className={styles.fieldLabel}>CITY</span>}
                  rules={[{ required: true, message: 'Please enter your city' }]}
                  className={styles.formItem}
                >
                  <Input
                    className={styles.darkInput}
                    size="large"
                    placeholder=""
                  />
                </Form.Item>

                {/* Pin Code */}
                <Form.Item
                  name="pincode"
                  label={<span className={styles.fieldLabel}>PIN CODE</span>}
                  rules={[
                    { required: true, message: 'Please enter your 6-digit PIN code' },
                    { pattern: /^\d{6}$/, message: 'PIN code must be 6 digits' },
                  ]}
                  className={styles.formItem}
                >
                  <Input
                    className={styles.darkInput}
                    size="large"
                    maxLength={6}
                    placeholder=""
                  />
                </Form.Item>

                {/* Notes (Optional) */}
                <Form.Item
                  name="notes"
                  label={<span className={styles.fieldLabel}>NOTES (OPTIONAL)</span>}
                  className={styles.formItem}
                >
                  <Input.TextArea
                    className={styles.darkTextArea}
                    rows={3}
                    placeholder="Bulk order, deadline, placement of print..."
                  />
                </Form.Item>

                {/* Divider Line */}
                <Divider className={styles.summaryDivider} />

                {/* Summary Lines */}
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Payment</span>
                  <span className={styles.summaryValue}>Cash on Delivery</span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Shipping</span>
                  <span className={styles.summaryValue}>Free</span>
                </div>

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalPrice}>₹{totalAmount}</span>
                </div>

                {/* Place Order CTA Button */}
                <SubmitButton
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                  disabled={cartItems.length === 0}
                  className={styles.placeOrderBtn}
                >
                  Place order — pay on delivery
                </SubmitButton>
              </Form>
            </div>
          </Col>
        </Row>
      </div>

      {/* Ant Design Order Confirmation Modal */}
      <Modal
        open={isSuccessModalOpen}
        onOk={handleModalClose}
        onCancel={handleModalClose}
        centered
        footer={[
          <SubmitButton
            key="ok"
            onClick={handleModalClose}
          >
            Continue Shopping
          </SubmitButton>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
          <CheckCircleFilled style={{ fontSize: 52, color: '#10B981', marginBottom: 16 }} />
          <h2 style={{ color: '#F5F2EB', fontSize: 22, margin: '0 0 8px' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: '#FF5E00', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>
            {placedOrder?.orderId}
          </p>
          <p style={{ color: '#A39D94', fontSize: 14, lineHeight: 1.5, margin: '0 0 20px' }}>
            Thank you, <strong style={{ color: '#F5F2EB' }}>{placedOrder?.delivery.fullName}</strong>.
            We will print your order fresh and deliver to{' '}
            <strong style={{ color: '#F5F2EB' }}>{placedOrder?.delivery.city} ({placedOrder?.delivery.pincode})</strong>.
            Please keep <strong style={{ color: '#FF5E00' }}>₹{placedOrder?.totalAmount}</strong> cash ready at delivery.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;
