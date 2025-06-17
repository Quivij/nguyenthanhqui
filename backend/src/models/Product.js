const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    slug: {
      type: String,
      unique: true,
      sparse: true, // Cho phép nhiều null nếu chưa set slug
    },

    description: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },

    variants: [
      {
        color: { type: String, required: true },
        storage: { type: String, required: true },
        price: { type: Number, required: true, min: 0 }, // Giá bán
        importPrice: { type: Number, required: true, min: 0 }, // ✅ Giá nhập
        images: [{ type: String, required: true }],
        stock: { type: Number, default: 0, min: 0 },
        sold: { type: Number, default: 0, min: 0 },
      },
    ],

    specifications: {
      screen: { type: String, default: "" },
      os: { type: String, default: "" },
      cpu: { type: String, default: "" },
      ram: { type: String, default: "" },
      battery: { type: String, default: "" },
      camera: { type: String, default: "" },
    },

    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Tự sinh slug nếu chưa có
productSchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    const baseSlug = slugify(this.name, { lower: true });
    let slug = baseSlug;
    let count = 1;

    // Đảm bảo slug không trùng
    while (await mongoose.models.Product.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    this.slug = slug;
  }

  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
