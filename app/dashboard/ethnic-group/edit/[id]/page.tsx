'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Col, Row } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import type { UploadFile } from 'antd/es/upload/interface';
import imageCompression from 'browser-image-compression';

const { Option } = Select;
const { TextArea } = Input;

interface EthnicCategory {
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

export default function EditEthnicGroup({ params }: { params: { id: string } }) {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EthnicCategory[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [file, setFile] = useState<UploadFile[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get<EthnicCategory[]>('/api/ethnic-category');
      setCategories(response.data);
    } catch (error) {
      message.error('ไม่สามารถโหลดประเภทกลุ่มชาติพันธุ์ได้');
    }
  }, []);

  const fetchEthnicGroupData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/ethnic-group/${params.id}`);
      const ethnicGroupData = response.data;
      form.setFieldsValue({
        ...ethnicGroupData,
        location: `${ethnicGroupData.district}, ${ethnicGroupData.amphoe}, ${ethnicGroupData.province}`,
      });
      if (ethnicGroupData.images) {
        setFileList(ethnicGroupData.images.map((image: any) => ({
          uid: image.id,
          name: image.url.split('/').pop(),
          status: 'done',
          url: image.url,
        })));
      }
      if (ethnicGroupData.fileUrl) {
        setFile([{
          uid: '-1',
          name: ethnicGroupData.fileUrl.split('/').pop(),
          status: 'done',
          url: ethnicGroupData.fileUrl,
        }]);
      }
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลกลุ่มชาติพันธุ์ได้');
    }
  }, [params.id, form]);

  useEffect(() => {
    fetchCategories();
    fetchEthnicGroupData();
    const uniqueDistricts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));
    setDistricts(uniqueDistricts);
  }, [fetchCategories, fetchEthnicGroupData]);

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

  const handleRemoveImage = (file: UploadFile) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
  };

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'fileUrl' && value !== undefined && value !== null) {
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
  
      // Handle file upload
      if (file.length > 0) {
        if (file[0].originFileObj) {
          formData.append('fileUrl', file[0].originFileObj);
        } else if (file[0].url) {
          formData.append('existingFile', file[0].url);
        }
      } else {
        formData.append('removeFile', 'true');
      }
  
      await axios.put(`/api/ethnic-group/${params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('แก้ไขข้อมูลกลุ่มชาติพันธุ์สำเร็จ');
      router.push('/dashboard/ethnic-group');
    } catch (error) {
      console.error('Error updating ethnic group:', error);
      message.error('ไม่สามารถแก้ไขข้อมูลกลุ่มชาติพันธุ์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขข้อมูลกลุ่มชาติพันธุ์</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4">
              <Form.Item name="categoryId" label="ประเภทกลุ่มชาติพันธุ์" rules={[{ required: true, message: "กรุณาเลือกประเภทกลุ่มชาติพันธุ์" }]}>
                <Select placeholder="เลือกประเภทกลุ่มชาติพันธุ์">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="name" label="ชื่อกลุ่มชาติพันธุ์" rules={[{ required: true, message: "กรุณากรอกชื่อกลุ่มชาติพันธุ์" }]}>
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

              <Form.Item name="village" label="หมู่บ้าน">
                <Input />
              </Form.Item>

              <Form.Item name="startYear" label="ปีที่เริ่มดำเนินการ" rules={[{ required: true, message: "กรุณากรอกปีที่เริ่มดำเนินการ" }]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="รายละเอียด" className="mb-4">
              <Form.Item name="history" label="ประวัติของกลุ่มชาติพันธุ์" rules={[{ required: true, message: "กรุณากรอกประวัติของกลุ่มชาติพันธุ์" }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="activityName" label="ชื่อกิจกรรม/งานชาติพันธุ์" rules={[{ required: true, message: "กรุณากรอกชื่อกิจกรรม/งานชาติพันธุ์" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="activityOrigin" label="ที่มาของกิจกรรม/งานชาติพันธุ์" rules={[{ required: true, message: "กรุณากรอกที่มาของกิจกรรม/งานชาติพันธุ์" }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="activityDetails" label="รายละเอียดการดำเนินกิจกรรม" rules={[{ required: true, message: "กรุณากรอกรายละเอียดการดำเนินกิจกรรม" }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="alcoholFreeApproach" label="แนวทางการจัดงานแบบปลอดเหล้า" rules={[{ required: true, message: "กรุณากรอกแนวทางการจัดงานแบบปลอดเหล้า" }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="results" label="ผลลัพธ์จากการดำเนินงาน">
                <TextArea rows={4} />
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

              <Form.Item name="fileUrl" label="ไฟล์ประกอบ">
                <Upload
                  fileList={file}
                  onChange={({ fileList }) => setFile(fileList)}
                  beforeUpload={() => false}
                  onRemove={() => setFile([])}
                >
                  {file.length === 0 && <Button icon={<UploadOutlined />}>อัพโหลดไฟล์</Button>}
                </Upload>
              </Form.Item>
              {file.length > 0 && <p>ไฟล์ที่เลือก: {file[0].name}</p>}
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