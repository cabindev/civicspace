// app/dashboard/ethnic-group/create/components/CreateEthnicGroupClient.tsx
'use client'

import React, { useState, useTransition } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Col, Row } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import type { UploadFile } from 'antd/es/upload/interface';
import imageCompression from 'browser-image-compression';

// Server Action
import { createEthnicGroup } from '@/app/lib/actions/ethnic-group/post';

const { Option } = Select;
const { TextArea } = Input;

interface EthnicCategory {
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
  history: string;
  activityName: string;
  activityOrigin: string;
  activityDetails: string;
  alcoholFreeApproach: string;
  results?: string;
  startYear: number;
  images?: UploadFile[];
  videoLink?: string;
  fileUrl?: UploadFile;
}

interface CreateEthnicGroupClientProps {
  initialCategories: EthnicCategory[];
}

export default function CreateEthnicGroupClient({ initialCategories }: CreateEthnicGroupClientProps) {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [categories] = useState<EthnicCategory[]>(initialCategories);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [file, setFile] = useState<UploadFile[]>([]);
  const [districts] = useState<string[]>(() => 
    Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)))
  );
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

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
    newFileList = newFileList.slice(-8);

    const processedFileList = await Promise.all(
      newFileList.map(async (file) => {
        if (file.originFileObj && !file.url) {
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

    setFileList(processedFileList.filter((file): file is UploadFile => file !== null));
  };

  const onFinish = async (values: FormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        
        // Add all form values
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'images' && key !== 'fileUrl' && value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Handle images
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });

        // Handle file upload
        if (file.length > 0 && file[0].originFileObj) {
          formData.append('fileUrl', file[0].originFileObj);
        }

        const result = await createEthnicGroup(formData);
        
        if (result.success) {
          message.success('สร้างข้อมูลกลุ่มชาติพันธุ์สำเร็จ');
          router.push('/dashboard/ethnic-group');
        } else {
          message.error(result.error || 'ไม่สามารถสร้างข้อมูลกลุ่มชาติพันธุ์ได้');
        }
      } catch (error) {
        console.error('Error creating ethnic group:', error);
        message.error('ไม่สามารถสร้างข้อมูลกลุ่มชาติพันธุ์ได้');
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
      <h1 className="text-2xl font-bold mb-4 text-green-700">สร้างข้อมูลกลุ่มชาติพันธุ์ใหม่</h1>
      <Form<FormValues> form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4 border-green-200">
              {renderFormItem("categoryId", "ประเภทกลุ่มชาติพันธุ์", 
                <Select placeholder="เลือกประเภทกลุ่มชาติพันธุ์">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>,
                [{ required: true, message: "กรุณาเลือกประเภทกลุ่มชาติพันธุ์" }]
              )}

              {renderFormItem("name", "ชื่อกลุ่มชาติพันธุ์", 
                <Input />,
                [{ required: true, message: "กรุณากรอกชื่อกลุ่มชาติพันธุ์" }]
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
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="รายละเอียด" className="mb-4 border-green-200">
              {renderFormItem("history", "ประวัติของกลุ่มชาติพันธุ์เบื้องต้น", 
                <TextArea rows={4} />,
                [{ required: true, message: "กรุณากรอกประวัติของกลุ่มชาติพันธุ์" }]
              )}

              {renderFormItem("activityName", "ชื่อกิจกรรม/งานชาติพันธุ์", 
                <Input />,
                [{ required: true, message: "กรุณากรอกชื่อกิจกรรม/งานชาติพันธุ์" }]
              )}

              {renderFormItem("activityOrigin", "ที่มาของกิจกรรม/งานชาติพันธุ์", 
                <TextArea rows={4} />,
                [{ required: true, message: "กรุณากรอกที่มาของกิจกรรม/งานชาติพันธุ์" }]
              )}

              {renderFormItem("activityDetails", "รายละเอียดการดำเนินกิจกรรม", 
                <TextArea rows={4} />,
                [{ required: true, message: "กรุณากรอกรายละเอียดการดำเนินกิจกรรม" }]
              )}

              {renderFormItem("alcoholFreeApproach", "แนวทางการจัดงานแบบปลอดเหล้า", 
                <TextArea rows={4} />,
                [{ required: true, message: "กรุณากรอกแนวทางการจัดงานแบบปลอดเหล้า" }]
              )}

              {renderFormItem("startYear", "ปีที่เริ่มดำเนินการให้ปลอดเหล้า (พ.ศ.)", 
                <InputNumber min={2400} max={2600} className="w-full" />,
                [{ required: true, message: "กรุณากรอกปีที่เริ่มดำเนินการ" }]
              )}

              {renderFormItem("results", "ผลลัพธ์จากการดำเนินงาน", <TextArea rows={4} />)}

              {renderFormItem("videoLink", "ลิงก์วิดีโอประกอบ", 
                <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
              )}

              {renderFormItem("images", "รูปภาพประกอบ", 
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleImageChange}
                  beforeUpload={() => false}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    className="border-green-500 text-green-600 hover:border-green-600 hover:text-green-700"
                  >
                    อัพโหลดรูปภาพ
                  </Button>
                </Upload>
              )}
              <p className="text-sm text-gray-600 mt-2">จำนวนรูปภาพที่เลือก: {fileList.length} (สามารถเลือกได้หลายรูป)</p>

              {renderFormItem("fileUrl", "ไฟล์ประกอบ", 
                <Upload
                  fileList={file}
                  onChange={({ fileList }) => setFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    className="border-green-500 text-green-600 hover:border-green-600 hover:text-green-700"
                  >
                    อัพโหลดไฟล์
                  </Button>
                </Upload>
              )}
              {file.length > 0 && <p className="text-sm text-gray-600 mt-2">ไฟล์ที่เลือก: {file[0].name}</p>}
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
            สร้างข้อมูลกลุ่มชาติพันธุ์
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}