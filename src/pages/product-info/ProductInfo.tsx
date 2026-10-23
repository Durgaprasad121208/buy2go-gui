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
import keychainImg from '../../assests/1cliq-keychain.jpg';
import mugImg from '../../assests/1cliq-mug.jpg';
import capImg from '../../assests/1cliq-cap.jpg';
import tshirtImg from '../../assests/1cliq-tshirt.jpg';
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

/* ==========================================================================
   Mock Initial Dataset (Mirrors REST API response structure)
   ========================================================================== */

const INITIAL_PRODUCT_CATALOG: Record<string, ProductRecord> = {
    keychain: {
        id: 'keychain',
        code: 'PRD-KC-01',
        title: 'CUSTOMISED KEY CHAIN',
        category: 'ACCESSORIES',
        price: 99,
        currency: '₹',
        description:
            'Durable acrylic key chain with your photo, name, or logo — perfect as gifts.',
        image: keychainImg,
        colors: [
            { id: 'clr-clear', label: 'Clear', value: 'clear', inStock: true },
            { id: 'clr-black', label: 'Black', value: 'black', inStock: true },
        ],
        hasTextToPrint: true,
        textPlaceholder: 'e.g. your name or a short line',
        maxPhotosAllowed: 8,
        allowedPhotoFormats: ['JPG', 'PNG', 'PDF'],
        isCodAvailable: true,
        minQuantity: 1,
        maxQuantity: 100,
        badges: [
            { id: 'b-1', label: 'Free delivery', type: 'delivery' },
            { id: 'b-2', label: 'Cash on delivery', type: 'cod' },
            { id: 'b-3', label: 'Printed fresh after your order', type: 'fresh' },
        ],
    },
    mug: {
        id: 'mug',
        code: 'PRD-MG-02',
        title: 'MUG PRINTING',
        category: 'DRINKWARE',
        price: 199,
        currency: '₹',
        description:
            'Glossy ceramic mugs with microwave-safe vivid sublimation print.',
        image: mugImg,
        colors: [
            { id: 'clr-white', label: 'White', value: 'white', inStock: true },
            { id: 'clr-black', label: 'Black', value: 'black', inStock: true },
        ],
        hasTextToPrint: true,
        textPlaceholder: 'e.g. favorite quote, name or date',
        maxPhotosAllowed: 4,
        allowedPhotoFormats: ['JPG', 'PNG', 'PDF'],
        isCodAvailable: true,
        minQuantity: 1,
        maxQuantity: 50,
        badges: [
            { id: 'b-1', label: 'Free delivery', type: 'delivery' },
            { id: 'b-2', label: 'Cash on delivery', type: 'cod' },
            { id: 'b-3', label: 'Printed fresh after your order', type: 'fresh' },
        ],
    },
    cap: {
        id: 'cap',
        code: 'PRD-CP-03',
        title: 'CAP PRINTING',
        category: 'APPAREL',
        price: 249,
        currency: '₹',
        description:
            'Structured 6-panel cotton twill caps with high-density embroidered monogram or print.',
        image: capImg,
        colors: [
            { id: 'clr-black', label: 'Black', value: 'black', inStock: true },
            { id: 'clr-white', label: 'White', value: 'white', inStock: true },
        ],
        hasTextToPrint: true,
        textPlaceholder: 'e.g. monogram, team or company name',
        maxPhotosAllowed: 2,
        allowedPhotoFormats: ['JPG', 'PNG', 'PDF'],
        isCodAvailable: true,
        minQuantity: 1,
        maxQuantity: 100,
        badges: [
            { id: 'b-1', label: 'Free delivery', type: 'delivery' },
            { id: 'b-2', label: 'Cash on delivery', type: 'cod' },
            { id: 'b-3', label: 'Printed fresh after your order', type: 'fresh' },
        ],
    },
    tshirt: {
        id: 'tshirt',
        code: 'PRD-TS-04',
        title: 'T-SHIRT PRINTING',
        category: 'APPAREL',
        price: 349,
        currency: '₹',
        description:
            '100% combed cotton 220 GSM heavyweight tees with breathable DTG print.',
        image: tshirtImg,
        colors: [
            { id: 'clr-black', label: 'Black', value: 'black', inStock: true },
            { id: 'clr-white', label: 'White', value: 'white', inStock: true },
        ],
        hasTextToPrint: true,
        textPlaceholder: 'e.g. back text, name or jersey number',
        maxPhotosAllowed: 4,
        allowedPhotoFormats: ['JPG', 'PNG', 'PDF'],
        isCodAvailable: true,
        minQuantity: 1,
        maxQuantity: 100,
        badges: [
            { id: 'b-1', label: 'Free delivery', type: 'delivery' },
            { id: 'b-2', label: 'Cash on delivery', type: 'cod' },
            { id: 'b-3', label: 'Printed fresh after your order', type: 'fresh' },
        ],
    },
};

/* ==========================================================================
   Component Props
   ========================================================================== */

export interface ProductInfoProps {
    initialProductId?: string;
    onBack?: () => void;
    onAddToCart?: (payload: OrderItemPayload, rawFiles: File[]) => void;
    onBuyNow?: (payload: OrderItemPayload, rawFiles: File[]) => void;
}

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

    // Determine active product key (fallback to keychain)
    const targetId = routeParamId || initialProductId || 'keychain';

    // API State management
    const [product, setProduct] = useState<ProductRecord>(
        INITIAL_PRODUCT_CATALOG[targetId] || INITIAL_PRODUCT_CATALOG.keychain
    );
    const [loading, setLoading] = useState<boolean>(false);

    // Sync state if route parameter changes (mirrors API fetch lifecycle)
    useEffect(() => {
        setLoading(true);
        const resolvedRecord =
            INITIAL_PRODUCT_CATALOG[targetId] || INITIAL_PRODUCT_CATALOG.keychain;
        setProduct(resolvedRecord);

        // Reset default color to first available option
        if (resolvedRecord.colors.length > 0) {
            setSelectedColor(resolvedRecord.colors[0].label);
        }
        setLoading(false);
    }, [targetId]);

    // Form & Customization state
    const [selectedColor, setSelectedColor] = useState<string>(
        product.colors[0]?.label || 'Clear'
    );
    const [customText, setCustomText] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Computed Values via useMemo
    const subtotal = useMemo(() => {
        return product.price * quantity;
    }, [product.price, quantity]);

    const orderPayload = useMemo<OrderItemPayload>(() => {
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

        if (uploadedFiles.length + incoming.length > product.maxPhotosAllowed) {
            richNotify.warning(`Maximum ${product.maxPhotosAllowed} photos allowed.`);
            return;
        }

        setUploadedFiles((prev) => [...prev, ...incoming]);
        richNotify.success(`${incoming.length} photo(s) attached successfully.`);
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart(orderPayload, uploadedFiles);
        } else {
            richNotify.success(
                `Added ${quantity} x "${product.title}" (${selectedColor}) to cart.`
            );
        }
    };

    const handleBuyNow = () => {
        if (onBuyNow) {
            onBuyNow(orderPayload, uploadedFiles);
        } else {
            navigate('/cart');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer} style={{ display: 'grid', placeItems: 'center' }}>
                <Spin size="large" />
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
