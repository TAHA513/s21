
import React, { useState } from 'react';
import { Form, Input, Button, Select, notification, Table } from 'antd';
import axios from 'axios';

const { Option } = Select;

interface DatabaseConnection {
  id: number;
  name: string;
  type: string;
  host: string;
  port: number;
  username: string;
  database: string;
  connectionString: string;
  createdAt: string;
  updatedAt: string;
}

const DatabaseSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);

  const fetchConnections = async () => {
    try {
      const { data } = await axios.get('/api/database-connections');
      setConnections(data);
    } catch (error) {
      notification.error({
        message: 'خطأ',
        description: 'فشل في جلب اتصالات قواعد البيانات',
      });
    }
  };

  React.useEffect(() => {
    fetchConnections();
  }, []);

  const handleTest = async () => {
    try {
      setTestLoading(true);
      const values = await form.validateFields();
      
      // بناء سلسلة الاتصال
      let connectionString = '';
      if (values.type === 'postgres') {
        connectionString = `postgres://${values.username}:${values.password}@${values.host}:${values.port || 5432}/${values.database}`;
      } else if (values.type === 'mysql') {
        connectionString = `mysql://${values.username}:${values.password}@${values.host}:${values.port || 3306}/${values.database}`;
      } else {
        connectionString = values.connectionString;
      }
      
      const { data } = await axios.post('/api/test-database', {
        ...values,
        connectionString
      });
      
      if (data.success) {
        notification.success({
          message: 'نجاح',
          description: 'تم الاتصال بقاعدة البيانات بنجاح',
        });
      } else {
        notification.error({
          message: 'خطأ',
          description: 'فشل الاتصال بقاعدة البيانات',
        });
      }
    } catch (error) {
      notification.error({
        message: 'خطأ',
        description: 'فشل اختبار الاتصال بقاعدة البيانات',
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // بناء سلسلة الاتصال
      let connectionString = '';
      if (values.type === 'postgres') {
        connectionString = `postgres://${values.username}:${values.password}@${values.host}:${values.port || 5432}/${values.database}`;
      } else if (values.type === 'mysql') {
        connectionString = `mysql://${values.username}:${values.password}@${values.host}:${values.port || 3306}/${values.database}`;
      } else {
        connectionString = values.connectionString;
      }
      
      await axios.post('/api/database-connections', {
        ...values,
        connectionString
      });
      
      notification.success({
        message: 'نجاح',
        description: 'تم إضافة اتصال قاعدة البيانات بنجاح',
      });
      
      form.resetFields();
      fetchConnections();
    } catch (error) {
      notification.error({
        message: 'خطأ',
        description: 'فشل في إضافة اتصال قاعدة البيانات',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'النوع',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'المضيف',
      dataIndex: 'host',
      key: 'host',
    },
    {
      title: 'قاعدة البيانات',
      dataIndex: 'database',
      key: 'database',
    },
    {
      title: 'تاريخ الإنشاء',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    }
  ];

  return (
    <div className="database-settings-container">
      <h2>إعدادات قاعدة البيانات</h2>
      
      <div className="connection-list">
        <h3>اتصالات قواعد البيانات الحالية</h3>
        <Table dataSource={connections} columns={columns} rowKey="id" />
      </div>
      
      <div className="add-connection-form">
        <h3>إضافة اتصال جديد</h3>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="اسم الاتصال"
            rules={[{ required: true, message: 'يرجى إدخال اسم الاتصال' }]}
          >
            <Input placeholder="اسم الاتصال" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="نوع قاعدة البيانات"
            rules={[{ required: true, message: 'يرجى اختيار نوع قاعدة البيانات' }]}
          >
            <Select placeholder="اختر نوع قاعدة البيانات">
              <Option value="postgres">PostgreSQL</Option>
              <Option value="mysql">MySQL</Option>
              <Option value="custom">مخصص</Option>
            </Select>
          </Form.Item>
          
          <Form.Item noStyle shouldUpdate={(prev, current) => prev.type !== current.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              
              if (type === 'custom') {
                return (
                  <Form.Item
                    name="connectionString"
                    label="سلسلة الاتصال"
                    rules={[{ required: true, message: 'يرجى إدخال سلسلة الاتصال' }]}
                  >
                    <Input.TextArea rows={3} placeholder="سلسلة الاتصال" />
                  </Form.Item>
                );
              }
              
              return (
                <>
                  <Form.Item
                    name="host"
                    label="المضيف"
                    rules={[{ required: true, message: 'يرجى إدخال المضيف' }]}
                  >
                    <Input placeholder="المضيف" />
                  </Form.Item>
                  
                  <Form.Item
                    name="port"
                    label="المنفذ"
                  >
                    <Input placeholder="المنفذ" type="number" />
                  </Form.Item>
                  
                  <Form.Item
                    name="database"
                    label="اسم قاعدة البيانات"
                    rules={[{ required: true, message: 'يرجى إدخال اسم قاعدة البيانات' }]}
                  >
                    <Input placeholder="اسم قاعدة البيانات" />
                  </Form.Item>
                  
                  <Form.Item
                    name="username"
                    label="اسم المستخدم"
                    rules={[{ required: true, message: 'يرجى إدخال اسم المستخدم' }]}
                  >
                    <Input placeholder="اسم المستخدم" />
                  </Form.Item>
                  
                  <Form.Item
                    name="password"
                    label="كلمة المرور"
                    rules={[{ required: true, message: 'يرجى إدخال كلمة المرور' }]}
                  >
                    <Input.Password placeholder="كلمة المرور" />
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
              حفظ
            </Button>
            <Button onClick={handleTest} loading={testLoading}>
              اختبار الاتصال
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default DatabaseSettingsPage;
import React, { useState } from 'react';

// نوع لإعدادات قاعدة البيانات
interface DatabaseSettings {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

// خصائص المكون
interface DatabaseSettingsProps {
  onSave: (settings: DatabaseSettings) => void;
  initialSettings?: Partial<DatabaseSettings>;
}

// مكون إعدادات قاعدة البيانات
export function DatabaseSettingsComponent({ onSave, initialSettings = {} }: DatabaseSettingsProps) {
  // حالة النموذج
  const [settings, setSettings] = useState<DatabaseSettings>({
    host: initialSettings.host || 'localhost',
    port: initialSettings.port || '5432',
    username: initialSettings.username || '',
    password: initialSettings.password || '',
    database: initialSettings.database || '',
  });

  // حالة الاختبار
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // معالج تغيير الحقول
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // معالج اختبار الاتصال
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // إرسال طلب لاختبار الاتصال
      const response = await fetch('/api/test-db-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({ success: true, message: 'تم الاتصال بنجاح!' });
      } else {
        setTestResult({ success: false, message: data.error || 'فشل الاتصال' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'خطأ في الشبكة' });
    } finally {
      setTesting(false);
    }
  };

  // معالج حفظ الإعدادات
  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold">إعدادات قاعدة البيانات</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label htmlFor="host" className="block text-sm font-medium">
            المضيف (Host)
          </label>
          <input
            id="host"
            name="host"
            type="text"
            value={settings.host}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="port" className="block text-sm font-medium">
            المنفذ (Port)
          </label>
          <input
            id="port"
            name="port"
            type="text"
            value={settings.port}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium">
            اسم المستخدم
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={settings.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={settings.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="database" className="block text-sm font-medium">
            اسم قاعدة البيانات
          </label>
          <input
            id="database"
            name="database"
            type="text"
            value={settings.database}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      
      <div className="flex space-x-4 rtl:space-x-reverse">
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
        >
          {testing ? 'جاري الاختبار...' : 'اختبار الاتصال'}
        </button>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          حفظ الإعدادات
        </button>
      </div>
      
      {testResult && (
        <div
          className={`p-3 rounded-md ${
            testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {testResult.message}
        </div>
      )}
    </div>
  );
}
