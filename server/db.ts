
// ملف وهمي بدون اتصال بقاعدة البيانات
// هذا الملف يحل محل الاتصال بقاعدة البيانات ويوفر واجهة مشابهة

// كائن وهمي لقاعدة البيانات
export const db = {
  // تنفيذ وهمي للاستعلامات
  query: async () => {
    return { rows: [] };
  },
  // تنفيذ وهمي للاختيار
  select: () => {
    return {
      from: () => {
        return {
          where: () => {
            return {
              get: async () => null,
              all: async () => [],
              execute: async () => {}
            };
          },
          all: async () => [],
          get: async () => null,
          execute: async () => {}
        };
      }
    };
  },
  // تنفيذ وهمي للإدراج
  insert: () => {
    return {
      values: (data: any) => {
        return {
          returning: () => {
            return {
              get: async () => ({ id: Math.floor(Math.random() * 1000) + 1, ...data }),
              execute: async () => {}
            };
          },
          execute: async () => {}
        };
      }
    };
  },
  // تنفيذ وهمي للتحديث
  update: () => {
    return {
      set: (data: any) => {
        return {
          where: () => {
            return {
              returning: () => {
                return {
                  get: async () => ({ id: Math.floor(Math.random() * 1000) + 1, ...data }),
                  execute: async () => {}
                };
              },
              execute: async () => {}
            };
          },
          execute: async () => {}
        };
      }
    };
  },
  // تنفيذ وهمي للحذف
  delete: () => {
    return {
      from: () => {
        return {
          where: () => {
            return {
              execute: async () => {}
            };
          },
          execute: async () => {}
        };
      }
    };
  }
};

// كائن وهمي للمجمع
export const pool = {
  query: async () => {
    return { rows: [] };
  },
  end: async () => {}
};

// وظيفة وهمية لاختبار الاتصال
export async function testConnection() {
  console.log('تم تعطيل الاتصال بقاعدة البيانات بشكل دائم');
  return true; // دائمًا ناجح لتجنب الأخطاء
}
