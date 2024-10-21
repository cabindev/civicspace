// app/dashboard/tradition/edit/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Col, Row } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import type { UploadFile } from 'antd/es/upload/interface';
import imageCompression from 'browser-image-compression';

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
  history: string;
  alcoholFreeApproach: string;
  results?: string;
  startYear: number;
  images?: UploadFile[];
  videoLink?: string;
  policyFile?: UploadFile;
}

export default function EditTradition({ params }: { params: { id: string } }) {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<TraditionCategory[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [policyFile, setPolicyFile] = useState<UploadFile[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get<TraditionCategory[]>('/api/tradition-category');
      setCategories(response.data);
    } catch (error) {
      message.error('ไม่สามารถโหลดประเภทงานบุญประเพณีได้');
    }
  }, []);

  const fetchTraditionData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/tradition/${params.id}`);
      const traditionData = response.data;
      form.setFieldsValue({
        ...traditionData,
        location: `${traditionData.district}, ${traditionData.amphoe}, ${traditionData.province}`,
      });
      if (traditionData.images) {
        setFileList(traditionData.images.map((image: any) => ({
          uid: image.id,
          name: image.url.split('/').pop(),
          status: 'done',
          url: image.url,
        })));
      }
      if (traditionData.policyFileUrl) {
        setPolicyFile([{
          uid: '-1',
          name: traditionData.policyFileUrl.split('/').pop(),
          status: 'done',
          url: traditionData.policyFileUrl,
        }]);
      }
    } catch (error) {
      console.error('Error fetching tradition data:', error);
      message.error('ไม่สามารถโหลดข้อมูลงานบุญประเพณีได้');
    }
  }, [params.id, form]);

  useEffect(() => {
    fetchCategories();
    fetchTraditionData();
    const uniqueDistricts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));
    setDistricts(uniqueDistricts);
  }, [fetchCategories, fetchTraditionData]);

  const handleDistrictChange = (value: string) => {
    const [district, amphoe, province] = value.split(', ');
    const regionData = data.find(d => d.district === district && d.amphoe === amphoe && d.province === province);
    if (regionData) {
      form.setFieldsValue({
        district: regionData.district,
        amphoe: regionData.amphoe,
        province: regionData.province,
        type: regionData.type,
        zipcode: regionData.zipcode || form.getFieldValue('zipcode'),
        district_code: regionData.district_code || form.getFieldValue('district_code'),
        amphoe_code: regionData.amphoe_code || form.getFieldValue('amphoe_code'),
        province_code: regionData.province_code || form.getFieldValue('province_code'),
      });
    }
  };

  const handleImageChange = async (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-8);  // Limit to 8 images
  
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

  const handleRemoveImage = (file: UploadFile) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
  };

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'policyFile' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
  
      // Handle images
      const existingImages = fileList.filter(file => file.url).map(file => file.url);
      formData.append('existingImages', JSON.stringify(existingImages));
  
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('newImages', file.originFileObj);
        }
      });
  
      // Handle policy file
      if (policyFile.length > 0) {
        if (policyFile[0].originFileObj) {
          formData.append('policyFile', policyFile[0].originFileObj);
        } else if (policyFile[0].url) {
          formData.append('existingPolicyFile', policyFile[0].url);
        }
      } else {
        formData.append('removePolicyFile', 'true');
      }
  
      await axios.put(`/api/tradition/${params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('แก้ไขข้อมูลงานบุญประเพณีสำเร็จ');
      router.push('/dashboard/tradition');
    } catch (error) {
      console.error('Error updating tradition:', error);
      message.error('ไม่สามารถแก้ไขข้อมูลงานบุญประเพณีได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขงานบุญประเพณี</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4">
              <Form.Item name="categoryId" label="ประเภทงานบุญประเพณี" rules={[{ required: true, message: "กรุณาเลือกประเภทงานบุญประเพณี" }]}>
                <Select placeholder="เลือกประเภทงานบุญประเพณี">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="name" label="ชื่องานบุญประเพณี" rules={[{ required: true, message: "กรุณากรอกชื่องานบุญประเพณี" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="location" label="พื้นที่" rules={[{ required: true, message: "กรุณาเลือกพื้นที่" }]}>
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
                </Select>
              </Form.Item>

              <Form.Item name="district" label="ตำบล">
                <Input readOnly className="bg-gray-100" />
              </Form.Item>
              <Form.Item name="amphoe" label="อำเภอ">
                <Input readOnly className="bg-gray-100" />
              </Form.Item>
              <Form.Item name="province" label="จังหวัด">
                <Input readOnly className="bg-gray-100" />
              </Form.Item>
              <Form.Item name="type" label="ภาค">
                <Input readOnly className="bg-gray-100" />
              </Form.Item>

              <Form.Item name="village" label="หมู่บ้าน">
                <Input />
              </Form.Item>

              <Form.Item name="coordinatorName" label="ชื่อผู้ประสานงาน" rules={[{ required: true, message: "กรุณากรอกชื่อผู้ประสานงาน" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="phone" label="เบอร์ติดต่อ">
                <Input />
              </Form.Item>

            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="รายละเอียด" className="mb-4">
              <Form.Item name="history" label="ประวัติของงานเบื้องต้น" rules={[{ required: true, message: "กรุณากรอกประวัติของงาน" }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="alcoholFreeApproach" label="ประวัติแนวทางการจัดงานแบบปลอดเหล้า" rules={[{ required: true, message: "กรุณากรอกแนวทางการจัดงานแบบปลอดเหล้า" }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="results" label="ผลลัพธ์จากการดำเนินงาน">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="startYear" label="ปีที่เริ่มดำเนินการให้ปลอดเหล้า (พ.ศ.)" rules={[{ required: true, message: "กรุณากรอกปีที่เริ่มดำเนินการ" }]}>
                <InputNumber min={2400} max={2600} className="w-full" />
              </Form.Item>

              <Form.Item name="images" label="รูปภาพประกอบ">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleImageChange}
                onRemove={handleRemoveImage}
                beforeUpload={() => false}
              >
                {fileList.length >= 8 ? null : <Button icon={<UploadOutlined />}>อัพโหลดรูปภาพ</Button>}
              </Upload>
            </Form.Item>
              <p className="mb-4">จำนวนรูปภาพที่เลือก: {fileList.length} (สามารถเลือกได้สูงสุด 8 รูป)</p>

              <Form.Item name="videoLink" label="ลิงก์วิดีโอประกอบ">
                <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
              </Form.Item>

              <Form.Item name="policyFile" label="ไฟล์นโยบายประกอบ">
                <Upload
                  fileList={policyFile}
                  onChange={({ fileList }) => setPolicyFile(fileList)}
                  beforeUpload={() => false}
                  onRemove={() => setPolicyFile([])}
                >
                  {policyFile.length === 0 && <Button icon={<UploadOutlined />}>อัพโหลดไฟล์นโยบาย</Button>}
                </Upload>
              </Form.Item>
              {policyFile.length > 0 && <p>ไฟล์ที่เลือก: {policyFile[0].name}</p>}
            </Card>
          </Col>
        </Row>

        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit" loading={loading}>
            บันทึกการแก้ไข
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}