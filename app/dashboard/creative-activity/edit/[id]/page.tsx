'use client'

import { useState, useEffect, useCallback, useTransition } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Col, Row } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import type { UploadFile } from 'antd/es/upload/interface';
import imageCompression from 'browser-image-compression';

// Server Actions
import { getCreativeCategories } from '@/app/lib/actions/creative-category/get';
import { getCreativeActivityById } from '@/app/lib/actions/creative-activity/get';
import { updateCreativeActivity } from '@/app/lib/actions/creative-activity/put';

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

  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCreativeCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        message.error('ไม่สามารถโหลดประเภทกิจกรรมสร้างสรรค์ได้');
      }
    } catch (error) {
      message.error('ไม่สามารถโหลดประเภทกิจกรรมสร้างสรรค์ได้');
    }
  }, []);

  const fetchActivityData = useCallback(async () => {
    try {
      const result = await getCreativeActivityById(params.id);
      if (!result.success) {
        message.error('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
        return;
      }
      const activityData = result.data;
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
      const category = categories.find(c => c.id === activityData.categoryId);
      if (category) {
        setSubCategories(category.subCategories);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
      message.error('ไม่สามารถโหลดข้อมูลกิจกรรมสร้างสรรค์ได้');
    }
  }, [params.id, form, categories]);

  useEffect(() => {
    fetchCategories();
    const uniqueDistricts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));
    setDistricts(uniqueDistricts);
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchActivityData();
    }
  }, [categories, fetchActivityData]);

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setSubCategories(category.subCategories);
      form.setFieldsValue({ subCategoryId: undefined });
    }
  };

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
        if (key !== 'images' && key !== 'reportFile' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
  
      // จัดการรูปภาพ
      const existingImages = fileList.filter(file => file.url).map(file => file.url);
      formData.append('existingImages', JSON.stringify(existingImages));
  
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('newImages', file.originFileObj);
        }
      });
  
      // จัดการไฟล์รายงาน
      if (reportFile.length > 0) {
        if (reportFile[0].originFileObj) {
          formData.append('reportFile', reportFile[0].originFileObj);
        } else if (reportFile[0].url) {
          formData.append('existingReportFile', reportFile[0].url);
        }
      } else {
        formData.append('removeReportFile', 'true');
      }
  
      const result = await updateCreativeActivity(params.id, { success: true, data: null }, formData);
      
      if (result.success) {
        message.success('แก้ไขข้อมูลกิจกรรมสร้างสรรค์สำเร็จ');
      } else {
        message.error(result.error || 'ไม่สามารถแก้ไขข้อมูลกิจกรรมสร้างสรรค์ได้');
        return;
      }
      router.push('/dashboard/creative-activity');
    } catch (error) {
      console.error('Error updating creative activity:', error);
      message.error('ไม่สามารถแก้ไขข้อมูลกิจกรรมสร้างสรรค์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขกิจกรรมสร้างสรรค์</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4">
              <Form.Item name="categoryId" label="ประเภทกิจกรรมสร้างสรรค์" rules={[{ required: true, message: "กรุณาเลือกประเภทกิจกรรมสร้างสรรค์" }]}>
                <Select placeholder="เลือกประเภทกิจกรรมสร้างสรรค์" onChange={handleCategoryChange}>
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="subCategoryId" label="หมวดหมู่ย่อย" rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่ย่อย" }]}>
                <Select placeholder="เลือกหมวดหมู่ย่อย">
                  {subCategories.map((subCategory) => (
                    <Option key={subCategory.id} value={subCategory.id}>{subCategory.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="name" label="ชื่อกิจกรรมสร้างสรรค์" rules={[{ required: true, message: "กรุณากรอกชื่อกิจกรรมสร้างสรรค์" }]}>
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
              <Form.Item name="description" label="รายละเอียดกิจกรรม" rules={[{ required: true, message: "กรุณากรอกรายละเอียดกิจกรรม" }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="summary" label="สรุปเนื้อหาการดำเนินงาน" rules={[{ required: true, message: "กรุณากรอกสรุปเนื้อหาการดำเนินงาน" }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="results" label="ผลลัพธ์จากการดำเนินงาน">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="startYear" label="ปีที่เริ่มดำเนินการ (พ.ศ.)" rules={[{ required: true, message: "กรุณากรอกปีที่เริ่มดำเนินการ" }]}>
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

              <Form.Item name="reportFile" label="ไฟล์รายงานประกอบ">
              <Upload
                fileList={reportFile}
                onChange={({ fileList }) => {
                  // อัพเดท state เมื่อมีการเปลี่ยนแปลงไฟล์
                  setReportFile(fileList);
                }}
                beforeUpload={() => false}
                onRemove={() => {
                  // เมื่อลบไฟล์ ให้เซ็ต reportFile เป็นอาเรย์ว่าง
                  setReportFile([]);
                }}
              >
                
                {reportFile.length === 0 && <Button icon={<UploadOutlined />}>อัพโหลดไฟล์รายงาน</Button>}
              </Upload>
            </Form.Item>

              {reportFile.length > 0 && <p>ไฟล์ที่เลือก: {reportFile[0].name}</p>}
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