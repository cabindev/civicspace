// app/dashboard/creative-activity/create/components/CreateCreativeActivityClient.tsx
'use client'

import { useState, useTransition } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Col, Row } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import { UploadFile } from 'antd/es/upload';
import imageCompression from 'browser-image-compression';

// Server Action
import { createCreativeActivity } from '@/app/lib/actions/creative-activity/post';

const { Option } = Select;
const { TextArea } = Input;

interface CreativeCategory {
  id: string;
  name: string;
  subCategories: CreativeSubCategory[];
}

interface CreativeSubCategory {
  id: string;
  name: string;
}

interface RegionData {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
  district_code: number;
  amphoe_code: number;
  province_code: number;
  type: string;
}

interface FormValues {
  categoryId: string;
  subCategoryId: string;
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
  description: string;
  summary: string;
  results?: string;
  startYear: number;
  images?: UploadFile[];
  videoLink?: string;
  reportFile?: UploadFile;
}

interface CreateCreativeActivityClientProps {
  initialCategories: CreativeCategory[];
}

export default function CreateCreativeActivityClient({ initialCategories }: CreateCreativeActivityClientProps) {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [categories] = useState<CreativeCategory[]>(initialCategories);
  const [subCategories, setSubCategories] = useState<CreativeSubCategory[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [reportFile, setReportFile] = useState<UploadFile[]>([]);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  // Pre-process district data
  const districts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSubCategories(category.subCategories);
      form.setFieldsValue({ subCategoryId: undefined });
    }
  };

  const handleDistrictChange = (value: string) => {
    const [district, amphoe, province] = value.split(', ');
    const regionData = data.find(d => d.district === district && d.amphoe === amphoe && d.province === province) as RegionData | undefined;
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

    // จำกัดจำนวนรูปภาพ
    newFileList = newFileList.slice(-8);

    const compressedFileList = await Promise.all(
      newFileList.map(async (file: UploadFile) => {
        if (file.originFileObj && !file.url) {  // เช็คว่าเป็นไฟล์ใหม่
          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
          if (!isJpgOrPng) {
            message.error(`ไฟล์ ${file.name} ไม่ใช่ไฟล์ JPG หรือ PNG`);
            return null;
          }
          if (file.size && file.size > 5 * 1024 * 1024) {  // 5MB
            message.error(`ขนาดไฟล์ ${file.name} ต้องไม่เกิน 5MB`);
            return null;
          }
          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: 'image/jpeg',  // กำหนดให้ผลลัพธ์เป็น JPEG เสมอ
          };
          try {
            const compressedFile = await imageCompression(file.originFileObj, options);
            const newFileName = `${file.name.split('.')[0]}.jpg`;  // เปลี่ยนนามสกุลไฟล์เป็น .jpg
            return {
              ...file,
              originFileObj: new File([compressedFile], newFileName, { type: 'image/jpeg' }),
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
    startTransition(async () => {
      try {
        const formData = new FormData();
        
        // Add all form values to FormData
        Object.entries(values).forEach(([key, value]) => {
          if (key === 'images') {
            // Images are handled separately below
            return;
          } else if (key === 'reportFile') {
            // Report file is handled separately below
            return;
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Add image files
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });

        // Add report file
        if (reportFile.length > 0 && reportFile[0].originFileObj) {
          formData.append('reportFile', reportFile[0].originFileObj);
        }

        const result = await createCreativeActivity(formData);
        
        if (result.success) {
          message.success('สร้างข้อมูลกิจกรรมสร้างสรรค์สำเร็จ');
          router.push('/dashboard/creative-activity');
        } else {
          message.error(result.error || 'ไม่สามารถสร้างข้อมูลกิจกรรมสร้างสรรค์ได้');
        }
      } catch (error) {
        console.error('Error creating creative activity:', error);
        message.error('ไม่สามารถสร้างข้อมูลกิจกรรมสร้างสรรค์ได้');
      }
    });
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
      <h1 className="text-2xl font-bold mb-4 text-green-700">สร้างกิจกรรมสร้างสรรค์ใหม่</h1>
      <Form<FormValues> form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4 border-green-200">
              {renderFormItem("categoryId", "ประเภทกิจกรรมสร้างสรรค์", 
                <Select placeholder="เลือกประเภทกิจกรรมสร้างสรรค์" onChange={handleCategoryChange}>
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>,
                [{ required: true, message: "กรุณาเลือกประเภทกิจกรรมสร้างสรรค์" }]
              )}

              {renderFormItem("subCategoryId", "หมวดหมู่ย่อย", 
                <Select placeholder="เลือกหมวดหมู่ย่อย">
                  {subCategories.map((subCategory) => (
                    <Option key={subCategory.id} value={subCategory.id}>{subCategory.name}</Option>
                  ))}
                </Select>,
                [{ required: true, message: "กรุณาเลือกหมวดหมู่ย่อย" }]
              )}

              {renderFormItem("name", "ชื่อกิจกรรมสร้างสรรค์", 
                <Input />,
                [{ required: true, message: "กรุณากรอกชื่อกิจกรรมสร้างสรรค์" }]
              )}

              {renderFormItem("location", "ตำบล > อำเภอ > จังหวัด", 
                <Select
                  showSearch
                  placeholder="เลือกตำบล > อำเภอ > จังหวัด"
                  optionFilterProp="children"
                  onChange={handleDistrictChange}
                  filterOption={(input, option) =>
                    option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
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

              {renderFormItem("zipcode", "รหัสไปรษณีย์", <InputNumber className="w-full" />, [], true)}
              {renderFormItem("district_code", "รหัสตำบล", <InputNumber className="w-full" />, [], true)}
              {renderFormItem("amphoe_code", "รหัสอำเภอ", <InputNumber className="w-full" />, [], true)}
              {renderFormItem("province_code", "รหัสจังหวัด", <InputNumber className="w-full" />, [], true)}

              {renderFormItem("village", "หมู่บ้าน", <Input />)}
              {renderFormItem("coordinatorName", "ชื่อผู้ประสานงาน", 
                <Input />,
                [{ required: true, message: "กรุณากรอกชื่อผู้ประสานงาน" }]
              )}
              {renderFormItem("phone", "เบอร์ติดต่อ", <Input />)}

            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="รายละเอียด" className="mb-4 border-green-200">
              {renderFormItem("description", "รายละเอียดกิจกรรม", 
                <TextArea rows={4} />,
                [{ required: true, message: "กรุณากรอกรายละเอียดกิจกรรม" }]
              )}

              {renderFormItem("summary", "สรุปเนื้อหาการดำเนินงาน", 
                <TextArea rows={4} />,
                [{ required: true, message: "กรุณากรอกสรุปเนื้อหาการดำเนินงาน" }]
              )}

              {renderFormItem("results", "ผลลัพธ์จากการดำเนินงาน", <TextArea rows={4} />)}

              {renderFormItem("startYear", "ปีที่เริ่มดำเนินการ (พ.ศ.)", 
                <InputNumber min={2400} max={2600} className="w-full" />,
                [{ required: true, message: "กรุณากรอกปีที่เริ่มดำเนินการ" }]
              )}

              {renderFormItem("images", "รูปภาพประกอบ", 
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleImageChange}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />} className="border-green-500 text-green-600 hover:border-green-600 hover:text-green-700">
                    อัพโหลดรูปภาพ
                  </Button>
                </Upload>
              )}
              <p className="text-sm text-gray-600">จำนวนรูปภาพที่เลือก: {fileList.length} (สามารถเลือกได้หลายรูป)</p>

              {renderFormItem("videoLink", "ลิงก์วิดีโอประกอบ", 
                <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
              )}

              {renderFormItem("reportFile", "ไฟล์รายงานประกอบ", 
                <Upload
                  fileList={reportFile}
                  onChange={({ fileList }) => setReportFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />} className="border-green-500 text-green-600 hover:border-green-600 hover:text-green-700">
                    อัพโหลดไฟล์รายงาน
                  </Button>
                </Upload>
              )}
              {reportFile.length > 0 && <p className="text-sm text-gray-600">ไฟล์ที่เลือก: {reportFile[0].name}</p>}
            </Card>
          </Col>
        </Row>

        <Form.Item className="text-center">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending}
            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
            size="large"
          >
            สร้างกิจกรรมสร้างสรรค์
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}