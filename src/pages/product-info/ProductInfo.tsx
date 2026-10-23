import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Row, Col, Input, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { richNotify } from '../../utils/notify';
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingBag,
    Truck,
    ShieldCheck,
    Check,
    ImagePlus,
    X,
} from 'lucide-react';
import { SubmitButton, DarkButton } from '../../components/app-button/AppButton';
import { productService } from '../../services/productService';
import styles from './ProductInfo.module.css';

/* ==========================================================================
   API-Friendly Data Models & Type Definitions
   ========================================================================== */

export type ProductCategory = 'ACCESSORIES' | 'DRINKWARE' | 'APPAREL';

export interface ProductColorOption {
    id: string;
    label: string;
    value: string;
    inStock?: boolean;
}

export interface TrustBadgeItem {
    id: string;
    label: string;
    type: 'delivery' | 'cod' | 'fresh';
}

/**
 * ProductRecord - Main backend-ready entity schema for products
 */
export interface ProductRecord {
    id: string;
    code: string;
    title: string;
    category: ProductCategory;
    price: number;
    currency: string;
    description: string;
    image: string;
    colors: ProductColorOption[];
    hasTextToPrint: boolean;
    textPlaceholder?: string;
    maxPhotosAllowed: number;
    allowedPhotoFormats: string[];
    isCodAvailable: boolean;
    minQuantity: number;
    maxQuantity: number;
    badges: TrustBadgeItem[];
}

/**
 * Cart / Checkout Payload Structure for REST API endpoints
 */
export interface OrderItemPayload {
    productId: string;
    productCode: string;
    productTitle: string;
    selectedColor: string;
    customText?: string;
    uploadedPhotoNames: string[];
    photoCount: number;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    currency: string;
    timestamp: string;
}

export const DEFAULT_PRODUCT_IMAGE =
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

export const DEFAULT_BADGES: TrustBadgeItem[] = [
    { id: 'b-1', label: 'Free delivery', type: 'delivery' },
    { id: 'b-2', label: 'Cash on delivery', type: 'cod' },
    { id: 'b-3', label: 'Printed fresh after your order', type: 'fresh' },
];

/* ==========================================================================
   Component Props
   ========================================================================== */

export interface ProductInfoProps {
    initialProductId?: string;
    onBack?: () => void;
    onAddToCart?: (payload: OrderItemPayload, rawFiles: File[]) => void;
    onBuyNow?: (payload: OrderItemPayload, rawFiles: File[]) => void;
}

export const mapToProductRecord = (apiData: any, targetId: string): ProductRecord => {
    let colorOptions: ProductColorOption[] = [];
    if (Array.isArray(apiData?.colors) && apiData.colors.length > 0) {
        colorOptions = apiData.colors.map((c: any, idx: number) =>
            typeof c === 'string'
                ? { id: `clr-${idx}`, label: c, value: c.toLowerCase(), inStock: true }
                : {
                      id: c.id || `clr-${idx}`,
                      label: c.label || c.name || 'Default',
                      value: c.value || 'default',
                      inStock: c.inStock ?? true,
                  }
        );
    } else if (typeof apiData?.colours === 'string' && apiData.colours.trim()) {
        colorOptions = apiData.colours.split(',').map((c: string, idx: number) => {
            const clean = c.trim();
            return { id: `clr-${idx}`, label: clean, value: clean.toLowerCase(), inStock: true };
        });
    } else {
        colorOptions = [
            { id: 'clr-default', label: 'Standard', value: 'standard', inStock: true },
        ];
    }

    return {
        id: String(apiData?.id || targetId),
        code: apiData?.code || `PRD-${String(apiData?.id || targetId).toUpperCase()}`,
        title: apiData?.title || apiData?.name || 'Custom Product',
        category: (apiData?.category || 'APPAREL').toUpperCase() as ProductCategory,
        price: Number(apiData?.price || 0),
        currency: apiData?.currency || '₹',
        description: apiData?.description || 'Personalized merchandise printed fresh on demand with premium materials.',
        image: apiData?.image || apiData?.imageUrl || apiData?.photoUrl || DEFAULT_PRODUCT_IMAGE,
        colors: colorOptions,
        hasTextToPrint: apiData?.hasTextToPrint ?? true,
        textPlaceholder: apiData?.textPlaceholder || 'e.g. your name or short line',
        maxPhotosAllowed: apiData?.maxPhotosAllowed || 8,
        allowedPhotoFormats: apiData?.allowedPhotoFormats || ['JPG', 'PNG', 'PDF'],
        isCodAvailable: apiData?.isCodAvailable ?? true,
        minQuantity: apiData?.minQuantity || 1,
        maxQuantity: apiData?.maxQuantity || 100,
        badges: apiData?.badges || DEFAULT_BADGES,
    };
};

/**
 * ProductInfo - API-friendly Product Details Component
 */
export const ProductInfo: React.FC<ProductInfoProps> = ({
    initialProductId,
    onBack,
    onAddToCart,
    onBuyNow,
}) => {
    const navigate = useNavigate();
    const { id: routeParamId } = useParams<{ id?: string }>();

    // Determine active product key
    const targetId = routeParamId || initialProductId || '';

    // API State management
    const [product, setProduct] = useState<ProductRecord | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Form & Customization state
    const [selectedColor, setSelectedColor] = useState<string>('Standard');
    const [customText, setCustomText] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state if route parameter changes - fetch live product via productService
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchProduct = async () => {
            if (!targetId) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                const res = await productService.getProductById(targetId);
                const data = (res as any)?.data || res;
                if (isMounted && data && (data.id || data.title || data.name)) {
                    const mapped = mapToProductRecord(data, targetId);
                    setProduct(mapped);
                    if (mapped.colors.length > 0) {
                        setSelectedColor(mapped.colors[0].label);
                    }
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn('Backend getProductById failed, querying catalog list:', err);
            }

            try {
                const catalogRes = await productService.getAllProducts();
                const catData = (catalogRes as any)?.data || catalogRes;
                const list = Array.isArray(catData) ? catData : (catData?.content || []);
                const found = list.find(
                    (p: any) => String(p.id) === String(targetId) || p.slug === targetId
                );
                if (isMounted && found) {
                    const mapped = mapToProductRecord(found, targetId);
                    setProduct(mapped);
                    if (mapped.colors.length > 0) {
                        setSelectedColor(mapped.colors[0].label);
                    }
                    setLoading(false);
                    return;
                }
            } catch (catalogErr) {
                console.error('Failed to load product from catalog:', catalogErr);
            }

            if (isMounted) {
                setProduct(null);
                setLoading(false);
            }
        };

        fetchProduct();
        return () => {
            isMounted = false;
        };
    }, [targetId]);

    // Computed Values via useMemo
    const subtotal = useMemo(() => {
        return product ? product.price * quantity : 0;
    }, [product, quantity]);

    const orderPayload = useMemo<OrderItemPayload | null>(() => {
        if (!product) return null;
        return {
            productId: product.id,
            productCode: product.code,
            productTitle: product.title,
            selectedColor,
            customText: customText.trim() || undefined,
            uploadedPhotoNames: uploadedFiles.map((f) => f.name),
            photoCount: uploadedFiles.length,
            quantity,
            unitPrice: product.price,
            totalAmount: subtotal,
            currency: product.currency,
            timestamp: new Date().toISOString(),
        };
    }, [product, selectedColor, customText, uploadedFiles, quantity, subtotal]);

    // Action Handlers
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/products');
        }
    };

    const handleQtyChange = (delta: number) => {
        if (!product) return;
        setQuantity((prev) => {
            const next = prev + delta;
            if (next < product.minQuantity) return product.minQuantity;
            if (next > product.maxQuantity) return product.maxQuantity;
            return next;
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const incoming = Array.from(e.target.files);
        const maxPhotos = product?.maxPhotosAllowed || 8;

        if (uploadedFiles.length + incoming.length > maxPhotos) {
            richNotify.warning(`Maximum ${maxPhotos} photos allowed.`);
            return;
        }

        setUploadedFiles((prev) => [...prev, ...incoming]);
        richNotify.success(`${incoming.length} photo(s) attached successfully.`);
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const saveItemToLocalStorage = () => {
        if (!product) return;
        const cartItem = {
            id: `item-${Date.now()}`,
            productId: product.id,
            title: product.title,
            variant: selectedColor,
            unitPrice: product.price,
            quantity,
            image: product.image,
            photos: uploadedFiles.map((f) => f.name),
        };
        try {
            const existing = JSON.parse(localStorage.getItem('buy2go_cart') || '[]');
            localStorage.setItem('buy2go_cart', JSON.stringify([...existing, cartItem]));
        } catch {
            // ignore
        }
    };

    const handleAddToCart = () => {
        if (!product || !orderPayload) return;
        saveItemToLocalStorage();
        if (onAddToCart) {
            onAddToCart(orderPayload, uploadedFiles);
        } else {
            richNotify.success(
                `Added ${quantity} x "${product.title}" (${selectedColor}) to cart.`
            );
        }
    };

    const handleBuyNow = () => {
        if (!product || !orderPayload) return;
        saveItemToLocalStorage();
        if (onBuyNow) {
            onBuyNow(orderPayload, uploadedFiles);
        } else {
            navigate('/cart');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer} style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.pageContainer} style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'center', padding: '60px 20px' }}>
                <div>
                    <h2 style={{ color: '#fff', marginBottom: 16 }}>Product Not Found</h2>
                    <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 24 }}>The product you are looking for does not exist or has been removed from catalogue.</p>
                    <DarkButton onClick={() => navigate('/products')}>Back to products</DarkButton>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Back Navigation Button */}
                <button
                    type="button"
                    onClick={handleBack}
                    className={styles.backLink}
                    aria-label="Back to products catalogue"
                >
                    <ArrowLeft size={16} />
                    <span>Back to products</span>
                </button>

                {/* Main 2-Column Grid */}
                <Row gutter={[48, 40]} className={styles.mainGrid}>
                    {/* Left Column: Product Mockup Image */}
                    <Col xs={24} lg={12}>
                        <div className={styles.imageCard}>
                            <img
                                src={product.image}
                                alt={product.title}
                                className={styles.productImage}
                            />
                        </div>
                    </Col>

                    {/* Right Column: Customization Controls & CTAs */}
                    <Col xs={24} lg={12} className={styles.detailsCol}>
                        {/* Category Tag */}
                        <span className={styles.categoryTag}>{product.category}</span>

                        {/* Product Headline */}
                        <h1 className={styles.productTitle}>{product.title}</h1>

                        {/* Subtitle Description */}
                        <p className={styles.description}>{product.description}</p>

                        {/* Price Display */}
                        <div className={styles.price}>
                            {product.currency}{product.price}
                        </div>

                        {/* Colour Selector */}
                        <span className={styles.fieldLabel}>COLOUR</span>
                        <div className={styles.colorOptionsRow}>
                            {product.colors.map((color) => {
                                const isActive = selectedColor === color.label;
                                return (
                                    <button
                                        key={color.id}
                                        type="button"
                                        className={`${styles.colorPill} ${isActive ? styles.colorPillActive : ''
                                            }`}
                                        onClick={() => setSelectedColor(color.label)}
                                    >
                                        {color.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Text to Print (Optional) */}
                        {product.hasTextToPrint && (
                            <div className={styles.textInputWrapper}>
                                <span className={styles.fieldLabel}>TEXT TO PRINT (OPTIONAL)</span>
                                <Input
                                    placeholder={product.textPlaceholder || 'e.g. your name or a short line'}
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    className={styles.customInput}
                                    maxLength={60}
                                />
                            </div>
                        )}

                        {/* Your Photos Upload Dropzone */}
                        <div className={styles.uploadSection}>
                            <span className={styles.fieldLabel}>YOUR PHOTOS</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept={product.allowedPhotoFormats
                                    .map((ext) => `.${ext.toLowerCase()}`)
                                    .join(',')}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />

                            <div
                                className={styles.uploadBox}
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                            >
                                <span className={styles.uploadIcon}>
                                    <ImagePlus size={28} strokeWidth={2} />
                                </span>
                                <p className={styles.uploadTitle}>Upload photos to print</p>
                                <p className={styles.uploadSubtitle}>
                                    {product.allowedPhotoFormats.join(', ')} · up to {product.maxPhotosAllowed} files
                                </p>
                            </div>

                            {/* Uploaded File Chips */}
                            {uploadedFiles.length > 0 && (
                                <div className={styles.uploadedFileList}>
                                    {uploadedFiles.map((file, idx) => (
                                        <div key={`${file.name}-${idx}`} className={styles.fileBadge}>
                                            <span>{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(idx)}
                                                className={styles.fileRemoveBtn}
                                                aria-label={`Remove photo ${file.name}`}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <span className={styles.uploadNote}>
                                You can also add more photos at checkout.
                            </span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className={styles.qtyRow}>
                            <span className={styles.qtyLabel}>QTY</span>
                            <div className={styles.qtyStepper}>
                                <button
                                    type="button"
                                    className={styles.qtyBtn}
                                    onClick={() => handleQtyChange(-1)}
                                    disabled={quantity <= product.minQuantity}
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className={styles.qtyValue}>{quantity}</span>
                                <button
                                    type="button"
                                    className={styles.qtyBtn}
                                    onClick={() => handleQtyChange(1)}
                                    disabled={quantity >= product.maxQuantity}
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons: Add to cart & Buy now COD */}
                        <div className={styles.actionsRow}>
                            <DarkButton
                                className={styles.cartBtn}
                                icon={<ShoppingBag size={18} strokeWidth={2} />}
                                onClick={handleAddToCart}
                            >
                                Add to cart
                            </DarkButton>

                            <SubmitButton
                                className={styles.buyBtn}
                                onClick={handleBuyNow}
                            >
                                Buy now — COD
                            </SubmitButton>
                        </div>

                        {/* Trust Badges */}
                        <div className={styles.trustBadges}>
                            {product.badges.map((badge) => {
                                let IconComponent = Truck;
                                if (badge.type === 'cod') IconComponent = ShieldCheck;
                                if (badge.type === 'fresh') IconComponent = Check;

                                return (
                                    <div key={badge.id} className={styles.trustItem}>
                                        <IconComponent
                                            size={16}
                                            className={styles.trustIcon}
                                            strokeWidth={badge.type === 'fresh' ? 2.5 : 2}
                                        />
                                        <span>{badge.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ProductInfo;
