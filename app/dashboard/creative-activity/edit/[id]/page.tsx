'use client'

import { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Col, Row, Modal } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import { UploadFile } from 'antd/es/upload';
import imageCompression from 'browser-image-compression';

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

export default function EditCreativeActivity({ params }: { params: { id: string } }) {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CreativeCategory[]>([]);
  const [subCategories, setSubCategories] = useState<CreativeSubCategory[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [reportFile, setReportFile] = useState<UploadFile[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
    fetchActivityData();
    const uniqueDistricts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));
    setDistricts(uniqueDistricts);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<CreativeCategory[]>('/api/creative-category');
      setCategories(response.data);
    } catch (error) {
      message.error('ไม่สามารถโหลดประเภทกิจกรรมสร้างสรรค์ได้');
    }
  };

  const fetchActivityData = async () => {
    try {
      const response = await axios.get(`/api/creative-activity/${params.id}`);
      const activityData = response.data;
      form.setFieldsValue({
        ...activityData,
        location: `${activityData.district}, ${activityData.amphoe}, ${activityData.province}`,
      });
      if (activityData.images) {
        setFileList(activityData.images.map((image: any) => ({
          uid: image.id,
          name: image.url.split('/').pop(),
          status: 'done',
          url: image.url,
        })));
      }
      if (activityData.reportFileUrl) {
        setReportFile([{
          uid: '-1',
          name: activityData.reportFileUrl.split('/').pop(),
          status: 'done',
          url: activityData.reportFileUrl,
        }]);
      }
      setSubCategories(categories.find(c => c.id === activityData.categoryId)?.subCategories || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลกิจกรรมสร้างสรรค์ได้');
    }
  };

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
    const { fileList } = info;
    try {
      const compressedFileList = await Promise.all(
        fileList.map(async (file: UploadFile) => {
          if (file.originFileObj && !file.url) {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
              message.error('คุณสามารถอัปโหลดไฟล์ JPG/PNG เท่านั้น!');
              return null;
            }
            const options = {
              maxSizeMB: 0.2,
              maxWidthOrHeight: 1024,
              useWebWorker: true,
              fileType: 'image/webp',
            };
            const compressedFile = await imageCompression(file.originFileObj, options);
            const webpFile = new File([compressedFile], `${file.name.split('.')[0]}.webp`, { type: 'image/webp' });
            return {
              ...file,
              originFileObj: webpFile,
              name: webpFile.name,
              type: 'image/webp',
            };
          }
          return file;
        })
      );
      setFileList(compressedFileList.filter(file => file !== null));
    } catch (error) {
      console.error('Error handling image change:', error);
      message.error('เกิดข้อผิดพลาดในการจัดการรูปภาพ');
    }
  };

  const handleRemoveImage = (file: UploadFile) => {
    Modal.confirm({
      title: 'ยืนยันการลบรูปภาพ',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?',
      onOk: async () => {
        try {
          await axios.delete(`/api/creative-activity/${params.id}/image/${file.uid}`);
          setFileList(fileList.filter(item => item.uid !== file.uid));
          message.success('ลบรูปภาพสำเร็จ');
        } catch (error) {
          console.error('Error deleting image:', error);
          message.error('ไม่สามารถลบรูปภาพได้');
        }
      },
    });
    return false; // Prevent default remove behavior
  };

  const handleReportFileChange = (info: any) => {
    const { fileList } = info;
    setReportFile(fileList);
  };

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'images') {
          fileList.forEach((file) => {
            if (file.originFileObj) {
              formData.append('images', file.originFileObj);
            }
          });
        } else if (key === 'reportFile' && reportFile.length > 0) {
          formData.append('reportFile', reportFile[0].originFileObj as File);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      await axios.put(`/api/creative-activity/${params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('แก้ไขข้อมูลกิจกรรมสร้างสรรค์สำเร็จ');
      router.push('/dashboard/creative-activity');
    } catch (error) {
      console.error('Error updating creative activity:', error);
      message.error('ไม่สามารถแก้ไขข้อมูลกิจกรรมสร้างสรรค์ได้');
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
      <style jsx global>{`
        .auto-filled .ant-input,
        .auto-filled .ant-input-number-input,
        .auto-filled .ant-select-selector {
          background-color: #e6f7e6 !important;
        }
      `}</style>
      <h1 className="text-2xl font-bold mb-4">แก้ไขกิจกรรมสร้างสรรค์</h1>
      <Form<FormValues> form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4">
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
                onRemove={handleRemoveImage}
                beforeUpload={() => false}
            >
                <Button icon={<UploadOutlined />}>อัพโหลดรูปภาพ</Button>
            </Upload>
            )}
            <p>จำนวนรูปภาพที่เลือก: {fileList.length} (สามารถเลือกได้หลายรูป)</p>

            {renderFormItem("videoLink", "ลิงก์วิดีโอประกอบ", 
            <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
            )}

            {renderFormItem("reportFile", "ไฟล์รายงานประกอบ", 
            <Upload
                fileList={reportFile}
                onChange={handleReportFileChange}
                beforeUpload={() => false}
            >
                <Button icon={<UploadOutlined />}>อัพโหลดไฟล์รายงาน</Button>
            </Upload>
            )}
            {reportFile.length > 0 && <p>ไฟล์ที่เลือก: {reportFile[0].name}</p>}
            </Card>
            </Col>
            </Row>

            <Form.Item className="text-center">
            <Button type="primary" htmlType="submit" loading={loading}>
            แก้ไขข้อมูลกิจกรรมสร้างสรรค์
            </Button>
            </Form.Item>
            </Form>
            </div>
            );
            }