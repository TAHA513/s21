
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
