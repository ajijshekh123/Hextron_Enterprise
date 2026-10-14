import React, { useState } from 'react';
import {
  Send,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  X,
  ShieldCheck,
  MessageCircle,
  Info
} from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

const initialFormData = {
  fullName: '',
  companyName: '',
  email: '',
  phone: '',
  serviceType: 'CNC Turning Job Work',
  material: 'Mild Steel (MS)',
  quantity: 'Small Batch (10 - 100 pcs)',
  requirements: '',
  attachment: null
};

export default function QuoteForm({ preselectedService }) {
  const [formData, setFormData] = useState({
    ...initialFormData,
    serviceType: preselectedService || initialFormData.serviceType
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success' | 'demo' | null
  const [attachmentName, setAttachmentName] = useState('');

  // Update if preselected service changes from parent
  React.useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, serviceType: preselectedService }));
    }
  }, [preselectedService]);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Please enter your company or workshop name';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please provide an email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please provide a valid phone / mobile number';
    } else if (!/^[+0-9\s-]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid telephone or mobile number';
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Please describe your component dimensions, tolerance needs, or job scope';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          attachment: 'File size must be under 15MB.'
        }));
        return;
      }

      // Allowed extensions
      const allowedExts = ['.pdf', '.dwg', '.dxf', '.step', '.stp', '.png', '.jpg', '.jpeg', '.zip'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(fileExt)) {
        setErrors((prev) => ({
          ...prev,
          attachment: 'Allowed formats: PDF, DWG, DXF, STEP, STP, JPG, PNG, ZIP.'
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, attachment: file }));
      setAttachmentName(file.name);
      setErrors((prev) => ({ ...prev, attachment: null }));
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, attachment: null }));
    setAttachmentName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Demonstration mode notice simulation
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionStatus('demo');
    }, 800);
  };

  // WhatsApp quick quote action generator
  const getWhatsAppQuoteUrl = () => {
    const text = `*New CNC Turning Quote Request - Hextron Enterprises*
------------------------------------
*Name:* ${formData.fullName || 'Not provided'}
*Company:* ${formData.companyName || 'Not provided'}
*Phone:* ${formData.phone || 'Not provided'}
*Email:* ${formData.email || 'Not provided'}
*Service:* ${formData.serviceType}
*Material:* ${formData.material}
*Quantity:* ${formData.quantity}
*Job Scope & Requirements:* ${formData.requirements || 'Drawings / samples will be shared'}
${attachmentName ? `*Attachment Prepared:* ${attachmentName}` : ''}
------------------------------------
Sent via hextronenterprise.com`;

    return `https://wa.me/${companyInfo.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="quote-wrapper" id="quote">
      <div className="quote-header-banner">
        <h3>Request a Precision Machining Quote</h3>
        <p>
          Send us your component drawings, CAD models, or sample specifications for review and commercial estimation.
        </p>
        <div className="demo-mode-badge">
          <Info size={14} />
          <span>Notice: Direct enquiry via Form Demo Mode & Instant WhatsApp available</span>
        </div>
      </div>

      <div className="quote-form-body">
        {submissionStatus === 'demo' && (
          <div className="form-feedback-alert demo">
            <Info size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4>Enquiry Validated (Demo Mode)</h4>
              <p>
                Your enquiry data has been verified. Because email delivery API credentials are intentionally kept secure and not hardcoded on the client, you can send these verified details directly to our technical team via <strong>WhatsApp</strong> below or email us directly at <strong>{companyInfo.email}</strong>.
              </p>
              <div style={{ marginTop: '0.75rem' }}>
                <a
                  href={getWhatsAppQuoteUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-quote"
                >
                  <MessageCircle size={18} />
                  <span>Send This Quote via WhatsApp Now</span>
                </a>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Rajesh Patel"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                required
              />
              {errors.fullName && (
                <span className="form-error-msg">
                  <AlertCircle size={13} /> {errors.fullName}
                </span>
              )}
            </div>

            {/* Company Name */}
            <div className="form-group">
              <label htmlFor="companyName" className="form-label">
                Company / Workshop Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Apex Auto Components Ltd."
                className={`form-input ${errors.companyName ? 'error' : ''}`}
                required
              />
              {errors.companyName && (
                <span className="form-error-msg">
                  <AlertCircle size={13} /> {errors.companyName}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rajesh@apexautocomponents.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                required
              />
              {errors.email && (
                <span className="form-error-msg">
                  <AlertCircle size={13} /> {errors.email}
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone / WhatsApp Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                required
              />
              {errors.phone && (
                <span className="form-error-msg">
                  <AlertCircle size={13} /> {errors.phone}
                </span>
              )}
            </div>

            {/* Required Component or Service */}
            <div className="form-group">
              <label htmlFor="serviceType" className="form-label">
                Required Component / Service
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="CNC Turning Job Work">CNC Turning Job Work</option>
                <option value="Custom Precision Turned Components">Custom Precision Turned Components</option>
                <option value="Prototype & Sample-Based Machining">Prototype & Sample-Based Machining</option>
                <option value="Drawing-Based Component Machining">Drawing-Based Component Machining</option>
                <option value="Small-Batch & Bulk Production">Small-Batch & Bulk Production</option>
                <option value="Material-Specific Machining">Material-Specific Machining</option>
                <option value="Other Machining Requirements">Other Machining Requirements</option>
              </select>
            </div>

            {/* Material Type */}
            <div className="form-group">
              <label htmlFor="material" className="form-label">
                Material Grade / Type
              </label>
              <select
                id="material"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Mild Steel (MS)">Mild Steel (MS)</option>
                <option value="Stainless Steel (SS 304 / 316 / 202)">Stainless Steel (SS 304 / 316 / 202)</option>
                <option value="Engineering Steels (EN8 / EN9 / EN19 / EN24 / EN31)">Engineering Steels (EN Series)</option>
                <option value="Brass (Free Cutting / Leaded)">Brass (Free Cutting / Leaded)</option>
                <option value="Aluminium (Machinable Alloys)">Aluminium Alloys</option>
                <option value="Copper (ETP / Commercial)">Copper</option>
                <option value="Customer-Supplied Raw Material">Customer-Supplied Raw Material</option>
                <option value="To Be Decided / Need Recommendation">To Be Decided / Need Recommendation</option>
              </select>
            </div>

            {/* Estimated Quantity */}
            <div className="form-group col-span-2">
              <label htmlFor="quantity" className="form-label">
                Estimated Order Quantity / Frequency
              </label>
              <select
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Prototype Samples (1 - 10 pcs)">Prototype Samples (1 - 10 pcs)</option>
                <option value="Small Trial Batch (10 - 100 pcs)">Small Trial Batch (10 - 100 pcs)</option>
                <option value="Standard Batch (100 - 1,000 pcs)">Standard Batch (100 - 1,000 pcs)</option>
                <option value="Production Bulk (1,000+ pcs)">Production Bulk (1,000+ pcs)</option>
                <option value="Recurring Monthly Job Work Contract">Recurring Monthly Job Work Contract</option>
              </select>
            </div>

            {/* Additional Requirements / Scope */}
            <div className="form-group col-span-2">
              <label htmlFor="requirements" className="form-label">
                Component Specifications & Requirements <span className="required">*</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows="4"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Mention key diameters, overall length, thread specifications, surface finish, delivery location, or whether you have physical samples."
                className={`form-textarea ${errors.requirements ? 'error' : ''}`}
                required
              />
              {errors.requirements && (
                <span className="form-error-msg">
                  <AlertCircle size={13} /> {errors.requirements}
                </span>
              )}
            </div>

            {/* File Attachment Upload Zone */}
            <div className="form-group col-span-2">
              <label className="form-label">
                Optional Drawing / Sample Photo Attachment
                <span className="optional">(PDF, DWG, DXF, STEP, JPG, PNG - Max 15MB)</span>
              </label>

              <div className={`file-upload-box ${attachmentName ? 'has-file' : ''}`}>
                <input
                  type="file"
                  id="attachment"
                  name="attachment"
                  onChange={handleFileChange}
                  className="file-input-hidden"
                  accept=".pdf,.dwg,.dxf,.step,.stp,.png,.jpg,.jpeg,.zip"
                />

                {!attachmentName ? (
                  <div className="file-upload-content">
                    <UploadCloud size={32} />
                    <div>
                      <strong style={{ color: 'var(--color-primary)' }}>Click to upload file</strong> or drag and drop
                    </div>
                    <span style={{ fontSize: '0.78rem' }}>
                      Customer drawings are kept confidential and never shared
                    </span>
                  </div>
                ) : (
                  <div className="file-name-display">
                    <FileCheck size={20} />
                    <span>{attachmentName}</span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="file-remove-btn"
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              {errors.attachment && (
                <span className="form-error-msg" style={{ marginTop: '0.4rem' }}>
                  <AlertCircle size={13} /> {errors.attachment}
                </span>
              )}
            </div>
          </div>

          <div className="form-footer-meta">
            <div className="privacy-notice">
              <ShieldCheck size={18} />
              <span>
                <strong>Confidentiality Commitment:</strong> All technical drawings, CAD files, and inquiry data are treated with strict confidentiality solely for providing quotations. No customer drawings or files are published.
              </span>
            </div>

            <div className="form-actions-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-submit-quote"
              >
                <Send size={18} />
                <span>{isSubmitting ? 'Validating...' : 'Submit Quote Request'}</span>
              </button>

              <a
                href={getWhatsAppQuoteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-quote"
              >
                <MessageCircle size={18} />
                <span>Instant WhatsApp Quote</span>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
