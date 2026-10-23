import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Upload,
  Checkbox,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import { richNotify } from '../../../utils/notify';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  UploadOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  SubmitButton,
  CancelButton,
} from '../../../components/app-button/AppButton';
import keychainImg from '../../../assests/1cliq-keychain.jpg';
import mugImg from '../../../assests/1cliq-mug.jpg';
import capImg from '../../../assests/1cliq-cap.jpg';
import tshirtImg from '../../../assests/1cliq-tshirt.jpg';
import styles from './AddProducts.module.css';

/* ==========================================================================
   Type Definitions (API-Ready)
   ========================================================================== */

export interface ProductFormData {
  name: string;
  category: string;
  price: number | string;
  sizes: string;
  colours: string;
  description: string;
  isLive: boolean;
  photoUrl?: string;
  photoName?: string;
}

export interface AdminProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  isLive: boolean;
  sizes?: string;
  colours?: string;
  description?: string;
}

export interface AddProductDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (product: AdminProductItem) => void;
  editingProduct?: AdminProductItem | null;
}

/* ==========================================================================
   Mock Initial Admin Catalog (Matching Screenshot 2)
   ========================================================================== */

const INITIAL_ADMIN_PRODUCTS: AdminProductItem[] = [
  {
    id: 'prod-cap',
    title: 'Custom Cap Printing',
    category: 'APPAREL',
    price: 249,
    image: capImg,
    isLive: true,
    sizes: 'Standard, Free Size',
    colours: 'Black, White, Navy',
    description: 'Structured 6-panel cotton twill cap with embroidery.',
  },
  {
    id: 'prod-mug',
    title: 'Custom Mug Printing',
    category: 'DRINKWARE',
    price: 199,
    image: mugImg,
    isLive: true,
    sizes: '325ml',
    colours: 'White Ceramic',
    description: 'Microwave and dishwasher safe glossy sublimation mug.',
  },
  {
    id: 'prod-kc',
    title: 'Customised Key Chain',
    category: 'ACCESSORIES',
    price: 99,
    image: keychainImg,
    isLive: true,
    sizes: 'Standard',
    colours: 'Clear, Black',
    description: 'Durable acrylic double-sided customized photo keychain.',
  },
  {
    id: 'prod-tee',
    title: 'T-Shirt Printing',
    category: 'APPAREL',
    price: 349,
    image: tshirtImg,
    isLive: true,
    sizes: 'S, M, L, XL, XXL',
    colours: 'Black, White',
    description: '100% combed cotton 220 GSM heavyweight tee.',
  },
];

/* ==========================================================================
   AddProductDrawer Component (Ant Design Drawer + Ant Design Form + AppButton)
   ========================================================================== */

export const AddProductDrawer: React.FC<AddProductDrawerProps> = ({
  open,
  onClose,
  onSuccess,
  editingProduct,
}) => {
  const [form] = Form.useForm<ProductFormData>();
  const [uploadedFileName, setUploadedFileName] = useState<string>('No file chosen');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync form values when drawer opens or editing target changes
  useEffect(() => {
    if (open) {
      if (editingProduct) {
        form.setFieldsValue({
          name: editingProduct.title,
          category: editingProduct.category,
          price: editingProduct.price,
          sizes: editingProduct.sizes || '',
          colours: editingProduct.colours || '',
          description: editingProduct.description || '',
          isLive: editingProduct.isLive,
        });
        setUploadedFileName(editingProduct.image ? 'Current photo attached' : 'No file chosen');
      } else {
        form.resetFields();
        form.setFieldsValue({
          isLive: true,
        });
        setUploadedFileName('No file chosen');
      }
    }
  }, [open, editingProduct, form]);

  const handleFinish = async (values: ProductFormData) => {
    try {
      setSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const savedProduct: AdminProductItem = {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        title: values.name,
        category: values.category.toUpperCase(),
        price: Number(values.price),
        image: editingProduct?.image || keychainImg,
        isLive: values.isLive ?? true,
        sizes: values.sizes,
        colours: values.colours,
        description: values.description,
      };

      if (onSuccess) {
        onSuccess(savedProduct);
      }

      richNotify.success(
        editingProduct
          ? `Product "${savedProduct.title}" updated successfully.`
          : `Product "${savedProduct.title}" published to shop!`
      );
      onClose();
    } catch {
      richNotify.error('Failed to save product. Please check form inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title={
        <span className={styles.drawerTitle}>
          {editingProduct ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
        </span>
      }
      placement="right"
      width="min(720px, 100vw)"
      open={open}
      onClose={onClose}
      destroyOnClose
      className={styles.drawerCustom}
      styles={{
        header: {
          backgroundColor: '#14100E',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 24px',
        },
        body: {
          backgroundColor: '#14100E',
          padding: '28px 24px',
        },
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        requiredMark={false}
        onFinish={handleFinish}
        initialValues={{
          isLive: true,
        }}
      >
        {/* Row 1: PRODUCT NAME & CATEGORY */}
        <Row gutter={20}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label={<span className={styles.fieldLabel}>PRODUCT NAME</span>}
              rules={[{ required: true, message: 'Please enter product name' }]}
              className={styles.formItem}
            >
              <Input
                className={styles.darkInput}
                placeholder="Custom hoodie"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="category"
              label={<span className={styles.fieldLabel}>CATEGORY</span>}
              rules={[{ required: true, message: 'Please enter category' }]}
              className={styles.formItem}
            >
              <Input
                className={styles.darkInput}
                placeholder="Apparel"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: PRICE & SIZES */}
        <Row gutter={20}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="price"
              label={<span className={styles.fieldLabel}>PRICE (₹)</span>}
              rules={[{ required: true, message: 'Please enter price' }]}
              className={styles.formItem}
            >
              <Input
                className={styles.darkInput}
                type="number"
                placeholder="349"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="sizes"
              label={
                <span className={styles.fieldLabel}>
                  SIZES (COMMA SEPARATED)
                </span>
              }
              className={styles.formItem}
            >
              <Input
                className={styles.darkInput}
                placeholder="S, M, L, XL"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 3: COLOURS & PRODUCT PHOTO */}
        <Row gutter={20}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="colours"
              label={
                <span className={styles.fieldLabel}>
                  COLOURS (COMMA SEPARATED)
                </span>
              }
              className={styles.formItem}
            >
              <Input
                className={styles.darkInput}
                placeholder="Black, White"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span className={styles.fieldLabel}>PRODUCT PHOTO</span>}
              className={styles.formItem}
            >
              <div className={styles.uploadContainer}>
                <Upload
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={(file) => {
                    setUploadedFileName(file.name);
                    richNotify.success(`Selected file: ${file.name}`);
                    return false; // Prevent automated HTTP post
                  }}
                >
                  <button type="button" className={styles.chooseFileBtn}>
                    <UploadOutlined style={{ marginRight: 6 }} />
                    Choose file
                  </button>
                </Upload>
                <span className={styles.uploadFileName} title={uploadedFileName}>
                  {uploadedFileName}
                </span>
              </div>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 4: DESCRIPTION */}
        <Form.Item
          name="description"
          label={<span className={styles.fieldLabel}>DESCRIPTION</span>}
          className={styles.formItem}
        >
          <Input.TextArea
            className={styles.darkTextArea}
            rows={4}
            placeholder=""
          />
        </Form.Item>

        {/* Row 5: CHECKBOX */}
        <Form.Item
          name="isLive"
          valuePropName="checked"
          className={styles.formItem}
        >
          <Checkbox className={styles.checkboxLabel}>
            Show this product in the shop
          </Checkbox>
        </Form.Item>

        {/* Row 6: ACTION BUTTONS (AppButton) */}
        <div className={styles.drawerActions}>
          <SubmitButton
            htmlType="submit"
            loading={submitting}
            className={styles.publishBtn}
          >
            {editingProduct ? 'Save changes' : 'Publish product'}
          </SubmitButton>

          <CancelButton
            onClick={onClose}
            className={styles.cancelBtn}
          >
            Cancel
          </CancelButton>
        </div>
      </Form>
    </Drawer>
  );
};

/* ==========================================================================
   AddProducts Page (Main Products Admin with Drawer Integration)
   ========================================================================== */

export const AddProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProductItem[]>(INITIAL_ADMIN_PRODUCTS);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product: AdminProductItem) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (savedItem: AdminProductItem) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === savedItem.id);
      if (exists) {
        return prev.map((p) => (p.id === savedItem.id ? savedItem : p));
      }
      return [savedItem, ...prev];
    });
  };

  const handleToggleLive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, isLive: !p.isLive };
          richNotify.info(
            `Product "${p.title}" is now ${updated.isLive ? 'LIVE' : 'HIDDEN'}.`
          );
          return updated;
        }
        return p;
      })
    );
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    richNotify.success(`Product "${target?.title || 'Item'}" deleted.`);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.contentWrapper}>
        {/* Top Header Section */}
        <div className={styles.headerTop}>
          <div>
            <span className={styles.ownerTag}>OWNER DASHBOARD</span>
            <h1 className={styles.pageTitle}>PRODUCTS</h1>
          </div>
          <button
            type="button"
            className={styles.signOutBtn}
            onClick={() => navigate('/')}
          >
            <LogoutOutlined />
            <span>Sign out</span>
          </button>
        </div>

        {/* Tabs Navigation (ORDERS / PRODUCTS) */}
        <div className={styles.tabsNav}>
          <button
            type="button"
            className={styles.tabItem}
            onClick={() => navigate('/admin/orders')}
          >
            ORDERS
          </button>
          <button
            type="button"
            className={`${styles.tabItem} ${styles.tabItemActive}`}
          >
            PRODUCTS
          </button>
        </div>

        {/* Sub-bar with Subtitle and + Add Product CTA */}
        <div className={styles.productsSubbar}>
          <p className={styles.subtitle}>
            Anything you publish here appears in the shop right away.
          </p>

          <SubmitButton
            onClick={handleOpenAdd}
            icon={<PlusOutlined />}
            style={{ height: 42, padding: '0 20px', borderRadius: 4 }}
          >
            Add product
          </SubmitButton>
        </div>

        {/* Products List Rows */}
        <div className={styles.productsList}>
          {products.map((item) => (
            <div key={item.id} className={styles.productRow}>
              {/* Product Info (Left) */}
              <div className={styles.productLeft}>
                <div className={styles.productThumbnail}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.productImg}
                  />
                </div>
                <div className={styles.productMeta}>
                  <h3 className={styles.productName}>{item.title}</h3>
                  <span className={styles.productCategory}>{item.category}</span>
                </div>
              </div>

              {/* Product Details & Actions (Right) */}
              <div className={styles.productRight}>
                <div className={styles.productPrice}>₹{item.price}</div>

                <span
                  className={item.isLive ? styles.liveBadge : styles.hiddenBadge}
                >
                  {item.isLive ? 'LIVE' : 'HIDDEN'}
                </span>

                <div className={styles.rowActions}>
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className={styles.editBtn}
                    aria-label="Edit product"
                  >
                    <EditOutlined style={{ fontSize: 14 }} />
                    <span>Edit</span>
                  </button>

                  {/* Hide/Show Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleLive(item.id)}
                    className={styles.hideBtn}
                    aria-label={item.isLive ? 'Hide product' : 'Make live'}
                  >
                    {item.isLive ? (
                      <>
                        <EyeInvisibleOutlined style={{ fontSize: 14 }} />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <EyeOutlined style={{ fontSize: 14 }} />
                        <span>Show</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <Popconfirm
                    title="Delete product"
                    description={`Are you sure you want to delete "${item.title}"?`}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDeleteProduct(item.id)}
                  >
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      aria-label="Delete product"
                      title="Delete product"
                    >
                      <DeleteOutlined style={{ fontSize: 16 }} />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ant Design Add/Edit Product Drawer */}
      <AddProductDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSuccess={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default AddProducts;
