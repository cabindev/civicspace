// app/dashboard/tradition/create/page.tsx
'use client'

import { useState, useEffect, useTransition } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Col, Row } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import { UploadFile } from 'antd/es/upload';
import { Radio, Space } from 'antd';
import imageCompression from 'browser-image-compression';

// Server Actions
import { getTraditionCategories } from '@/app/lib/actions/tradition-category/get';
import { createTradition } from '@/app/lib/actions/tradition/post';

const { Option } = Select;
const { TextArea } = Input;

interface TraditionCategory {
  id: string;
  name: string;
}

interface FormValues {
  categoryId: string;
  name: string;
  location: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode?: number;
  district_code?: number;
  amphoe_code?: number;
  province_code?: number;
  type: string;
  village?: string;
  coordinatorName: string;
  phone: string;
  history?: string;
  alcoholFreeApproach?: string;
  results?: string;
  startYear?: number;
  images?: UploadFile[];
  videoLink?: string;
  policyFile?: UploadFile;
  hasPolicy: boolean;
  hasAnnouncement: boolean;
  hasInspector: boolean;
  hasMonitoring: boolean;
  hasCampaign: boolean;
  hasAlcoholPromote: boolean;
}

export default function CreateTradition() {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<TraditionCategory[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [policyFile, setPolicyFile] = useState<UploadFile[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
    const uniqueDistricts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));
    setDistricts(uniqueDistricts);
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await getTraditionCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        message.error('ไม่สามารถโหลดประเภทงานบุญประเพณีได้');
      }
    } catch (error) {
      message.error('ไม่สามารถโหลดประเภทงานบุญประเพณีได้');
    }
  };

  const handleDistrictChange = (value: string) => {
    const [district, amphoe, province] = value.split(', ');
    const regionData = data.find(d => d.district === district && d.amphoe === amphoe && d.province === province);
    if (regionData) {
      const formValues: any = {
        location: value,
        district: regionData.district,
        amphoe: regionData.amphoe,
        province: regionData.province,
        type: regionData.type,
        zipcode: regionData.zipcode,
        district_code: regionData.district_code,
        amphoe_code: regionData.amphoe_code,
        province_code: regionData.province_code,
      };
      form.setFieldsValue(formValues);
      setAutoFilledFields(new Set(['district', 'amphoe', 'province', 'type', 'zipcode', 'district_code', 'amphoe_code', 'province_code']));
    }
  };

  const handleImageChange = async (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-8);  // จำกัดจำนวนรูปภาพไม่เกิน 8 รูป
  
    const compressedFileList = await Promise.all(
      newFileList.map(async (file: UploadFile) => {
        if (file.originFileObj && !file.url) {
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
          if (!isJpgOrPng) {
            message.error(`ไฟล์ ${file.name} ไม่ใช่ไฟล์ JPG, PNG หรือ WebP`);
            return null;
          }
          if (file.size && file.size > 5 * 1024 * 1024) {
            message.error(`ขนาดไฟล์ ${file.name} ต้องไม่เกิน 5MB`);
            return null;
          }
          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: 'image/webp' as const,
          };
          try {
            const compressedFile = await imageCompression(file.originFileObj, options);
            const newFileName = `${file.name.split('.')[0]}.webp`;
            return {
              ...file,
              originFileObj: new File([compressedFile], newFileName, { type: 'image/webp' }),
              name: newFileName,
            };
          } catch (error) {
            console.error('Error compressing image:', error);
            message.error(`ไม่สามารถบีบอัดรูปภาพ ${file.name} ได้`);
            return null;
          }
        }
        return file;
      })
    );
  
    newFileList = compressedFileList.filter(file => file !== null);
    setFileList(newFileList);
  };

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'images') {
          fileList.forEach((file, index) => {
            if (file.originFileObj) {
              formData.append(`images`, file.originFileObj, `image_${index}.webp`);
            }
          });
        } else if (key === 'policyFile' && policyFile.length > 0) {
          formData.append('policyFile', policyFile[0].originFileObj as File);
        } else if (
          // เพิ่มเงื่อนไขสำหรับข้อมูลแบบ boolean
          ['hasPolicy', 'hasAnnouncement', 'hasInspector', 'hasMonitoring', 'hasCampaign', 'hasAlcoholPromote'].includes(key)
        ) {
          // แปลงค่า boolean เป็น string 'true' หรือ 'false'
          formData.append(key, value.toString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
  
      // เพิ่ม validation สำหรับฟิลด์ที่จำเป็น
      const requiredBooleanFields = [
        'hasPolicy',
        'hasAnnouncement', 
        'hasInspector',
        'hasMonitoring',
        'hasCampaign',
        'hasAlcoholPromote'
      ];
  
      // ตรวจสอบว่าทุกฟิลด์มีค่าถูกส่งมาครบ
      const missingFields = requiredBooleanFields.filter(
        field => !formData.has(field)
      );
  
      if (missingFields.length > 0) {
        throw new Error(`กรุณากรอกข้อมูลให้ครบทุกข้อ: ${missingFields.join(', ')}`);
      }
  
      const result = await createTradition(formData);
      
      if (result.success) {
        message.success('สร้างข้อมูลงานบุญประเพณีสำเร็จ');
        router.push('/dashboard/tradition');
      } else {
        message.error(result.error || 'ไม่สามารถสร้างข้อมูลงานบุญประเพณีได้');
      }
    } catch (error) {
      console.error('Error creating tradition:', error);
      if (error instanceof Error) {
        // แสดงข้อความ error ที่เฉพาะเจาะจง
        message.error(error.message);
      } else {
        message.error('ไม่สามารถสร้างข้อมูลงานบุญประเพณีได้');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFormItem = (name: string, label: string, component: React.ReactNode, rules?: any[], hidden: boolean = false) => (
    <Form.Item 
      name={name} 
      label={hidden ? undefined : label} 
      rules={rules}
      className={autoFilledFields.has(name) ? 'auto-filled' : ''}
      hidden={hidden}
    >
      {component}
    </Form.Item>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">สร้างงานบุญประเพณีใหม่</h1>
      <Form<FormValues> form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4">
              {renderFormItem("categoryId", "ประเภทงานบุญประเพณี", 
                <Select placeholder="เลือกประเภทงานบุญประเพณี">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>,
                [{ required: true, message: "กรุณาเลือกประเภทงานบุญประเพณี" }]
              )}

              {renderFormItem("name", "ชื่องานบุญประเพณี", 
                <Input />,
                [{ required: true, message: "กรุณากรอกชื่องานบุญประเพณี" }]
              )}

              {renderFormItem("location", "ตำบล > อำเภอ > จังหวัด", 
                <Select
                  showSearch
                  placeholder="เลือกตำบล > อำเภอ > จังหวัด"
                  optionFilterProp="children"
                  onChange={handleDistrictChange}
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {districts.map((district) => (
                    <Option key={district} value={district}>{district}</Option>
                  ))}
                </Select>,
                [{ required: true, message: "กรุณาเลือกตำบล" }]
              )}

              {renderFormItem("district", "ตำบล", <Input readOnly />, [{ required: true }])}
              {renderFormItem("amphoe", "อำเภอ", <Input readOnly />, [{ required: true }])}
              {renderFormItem("province", "จังหวัด", <Input readOnly />, [{ required: true }])}
              {renderFormItem("type", "ภาค", <Input readOnly />, [{ required: true }])}

              {renderFormItem("zipcode", "รหัสไปรษณีย์", <InputNumber />, [], true)}
              {renderFormItem("district_code", "รหัสตำบล", <InputNumber />, [], true)}
              {renderFormItem("amphoe_code", "รหัสอำเภอ", <InputNumber />, [], true)}
              {renderFormItem("province_code", "รหัสจังหวัด", <InputNumber />, [], true)}

              {renderFormItem("village", "หมู่บ้าน", <Input />)}
              {renderFormItem("coordinatorName", "ชื่อผู้ประสานงาน", 
                <Input />,
                [{ required: true, message: "กรุณากรอกชื่อผู้ประสานงาน" }]
              )}
              {renderFormItem("phone", "เบอร์ติดต่อ", <Input />)}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="รายละเอียด" className="mb-4">
              {renderFormItem("history", "ประวัติของงานเบื้องต้น", 
                <TextArea rows={4} />
              )}

              {renderFormItem("alcoholFreeApproach", "ประวัติแนวทางการจัดงานแบบปลอดเหล้า", 
                <TextArea rows={4} />
              )}

              {renderFormItem("results", "ผลลัพธ์จากการดำเนินงาน", <TextArea rows={4} />)}

              {renderFormItem("startYear", "ปีที่เริ่มดำเนินการให้ปลอดเหล้า (พ.ศ.)", 
                <InputNumber min={2400} max={2600} className="w-full" />
              )}

              {renderFormItem("images", "รูปภาพประกอบ", 
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleImageChange}
                  beforeUpload={() => false}
                >
                  {fileList.length >= 8 ? null : <Button icon={<UploadOutlined />}>อัพโหลดรูปภาพ</Button>}
                </Upload>
              )}
              <p className="mb-4">จำนวนรูปภาพที่เลือก: {fileList.length} (สามารถเลือกได้สูงสุด 8 รูป)</p>

              {renderFormItem("videoLink", "ลิงก์วิดีโอประกอบ", 
                <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
              )}

              {renderFormItem("policyFile", "ไฟล์นโยบายประกอบ", 
                <Upload
                  fileList={policyFile}
                  onChange={({ fileList }) => setPolicyFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>อัพโหลดไฟล์นโยบาย</Button>
                </Upload>
              )}
              {policyFile.length > 0 && <p>ไฟล์ที่เลือก: {policyFile[0].name}</p>}
            </Card>
          </Col>
        </Row>
        <Card title="การดำเนินการและมาตรการ" className="mb-4">
  <div className="space-y-4">
    {[
      {
        name: "hasPolicy",
        label: "1. มีการกำหนดนโยบาย มาตรการธรรมนูญชุมชนร่วมกันของคณะกรรมการจังหวัดหรืออำเภอ เพื่อให้การจัดงานบุญ งานประเพณี งานเทศกาล ปลอดเครื่องดื่มแอลกอฮอล์"
      },
      {
        name: "hasAnnouncement",
        label: "2. มีเอกสาร คำสั่ง ป้ายประกาศ บริเวณทางเข้าหรือรอบ ๆ บริเวณ เพื่อแสดงให้ผู้ร่วมงานรับทราบร่วมกันว่าเป็นการจัดงานปลอดเครื่องดื่มแอลกอฮอล์"
      },
      {
        name: "hasInspector",
        label: "3. มีเจ้าหน้าที่กำกับดูแล/คณะกรรมการจังหวัดหรืออำเภอ ตรวจสอบบริเวณการจัดงานอย่างสม่ำเสมอ"
      },
      {
        name: "hasMonitoring",
        label: "4. มีเจ้าหน้าที่ในการเฝ้าระวังและตรวจสอบการนำเครื่องดื่มแอลกอฮอล์เข้ามาในงานบุญ งานประเพณี งานเทศกาล"
      },
      {
        name: "hasCampaign",
        label: "5. มีการจัดกิจกรรรมรณรงค์ประชาสัมพันธ์จากเจ้าหน้าที่หรือภาคีเครือข่ายในพื้นที่ เพื่อให้งานบุญ งานประเพณี งานเทศกาล ปลอดเครื่องดื่มแอลกอฮอล์"
      },
      {
        name: "hasAlcoholPromote",
        label: "6. มีการรับหรือสนับสนุนหรือพบเห็นการโฆษณาเครื่องดื่มแอลกอฮอล์จากธุรกิจสุราในพื้นที่"
      }
    ].map((item) => (
      <Form.Item
        key={item.name}
        name={item.name}
        label={item.label}
        rules={[{ required: true, message: "กรุณาเลือกคำตอบ" }]}
      >
        <Radio.Group>
          <Space direction="horizontal">
            <Radio value={true}>ใช่</Radio>
            <Radio value={false}>ไม่ใช่</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
    ))}
  </div>
</Card>
        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit" loading={isPending || loading}>
            สร้างงานบุญประเพณี
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}