import Category from "../features/services/category.model";

export interface CategoryData {
  name: string;
}

const defaultCategories: CategoryData[] = [
  {
    name: "Entrenamiento Personal",
  },
  {
    name: "Fitness Grupal",
  },
  {
    name: "Coaching Nutricional",
  },
  {
    name: "Yoga y Pilates",
  },
  {
    name: "Entrenamiento de Fuerza",
  },
  {
    name: "Entrenamiento Cardiovascular",
  },
  {
    name: "Coaching Deportivo",
  },
  {
    name: "Rehabilitación",
  },
  {
    name: "Coaching de Bienestar",
  },
  {
    name: "Artes Marciales",
  },
];

export const seedCategories = async (): Promise<void> => {
  try {
    console.log("🌱 Seeding categories...");

    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });

      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Created category: ${categoryData.name}`);
      }
    }

    console.log("🎉 Categories seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
};

export const getAllCategories = async () => {
  return await Category.find({ isActive: true }).sort({ name: 1 });
};

export const getCategoryById = async (id: string) => {
  return await Category.findById(id);
};

export const createCategory = async (categoryData: CategoryData) => {
  return await Category.create(categoryData);
};

export const updateCategory = async (id: string, updateData: Partial<CategoryData>) => {
  return await Category.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true }
  );
};

export const deleteCategory = async (id: string) => {
  return await Category.findByIdAndUpdate(
    id,
    { isActive: false, updatedAt: new Date() },
    { new: true }
  );
};
