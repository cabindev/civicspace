// app/dashboard/ethnic-group/edit/[id]/components/EditEthnicGroupClient.tsx
'use client'

import React, { useState, useTransition } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, message, Card, Col, Row } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import type { UploadFile } from 'antd/es/upload/interface';
import imageCompression from 'browser-image-compression';

// Server Action
import { updateEthnicGroupDirect } from '@/app/lib/actions/ethnic-group/put';

const { Option } = Select;
const { TextArea } = Input;

interface EthnicCategory {
  id: string;
  name: string;
}

interface EthnicGroup {
  id: string;
  categoryId: string;
  name: string;
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
  images: { id: string; url: string }[];
  videoLink?: string;
  fileUrl?: string;
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

interface EditEthnicGroupClientProps {
  ethnicGroup: EthnicGroup;
  initialCategories: EthnicCategory[];
}

export default function EditEthnicGroupClient({ ethnicGroup, initialCategories }: EditEthnicGroupClientProps) {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [categories] = useState<EthnicCategory[]>(initialCategories);
  const [fileList, setFileList] = useState<UploadFile[]>(() => 
    ethnicGroup.images?.map((image, index) => ({
      uid: image.id || index.toString(),
      name: image.url.split('/').pop() || `image-${index}`,
      status: 'done' as const,
      url: image.url,
    })) || []
  );
  const [file, setFile] = useState<UploadFile[]>(() => 
    ethnicGroup.fileUrl ? [{
      uid: '-1',
      name: ethnicGroup.fileUrl.split('/').pop() || 'file',
      status: 'done' as const,
      url: ethnicGroup.fileUrl,
    }] : []
  );
  const [isPending, startTransition] = useTransition();

  // Pre-process district data and set initial values
  React.useEffect(() => {
    const initialValues = {
      categoryId: ethnicGroup.categoryId,
      name: ethnicGroup.name,
      location: `${ethnicGroup.district}, ${ethnicGroup.amphoe}, ${ethnicGroup.province}`,
      district: ethnicGroup.district,
      amphoe: ethnicGroup.amphoe,
      province: ethnicGroup.province,
      zipcode: ethnicGroup.zipcode,
      district_code: ethnicGroup.district_code,
      amphoe_code: ethnicGroup.amphoe_code,
      province_code: ethnicGroup.province_code,
      type: ethnicGroup.type,
      village: ethnicGroup.village,
      history: ethnicGroup.history,
      activityName: ethnicGroup.activityName,
      activityOrigin: ethnicGroup.activityOrigin,
      activityDetails: ethnicGroup.activityDetails,
      alcoholFreeApproach: ethnicGroup.alcoholFreeApproach,
      results: ethnicGroup.results,
      startYear: ethnicGroup.startYear,
      videoLink: ethnicGroup.videoLink,
    };
    form.setFieldsValue(initialValues);
  }, [form, ethnicGroup]);

  const districts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));

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

        const result = await updateEthnicGroupDirect(ethnicGroup.id, formData);
        
        if (result.success) {
          message.success('แก้ไขข้อมูลกลุ่มชาติพันธุ์สำเร็จ');
          router.push('/dashboard/ethnic-group');
        } else {
          message.error(result.error || 'ไม่สามารถแก้ไขข้อมูลกลุ่มชาติพันธุ์ได้');
        }
      } catch (error) {
        console.error('Error updating ethnic group:', error);
        message.error('ไม่สามารถแก้ไขข้อมูลกลุ่มชาติพันธุ์ได้');
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-700">แก้ไขข้อมูลกลุ่มชาติพันธุ์</h1>
      <Form<FormValues> form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4 border-green-200">
              <Form.Item 
                name="categoryId" 
                label="กลุ่มชาติพันธุ์"
                rules={[{ required: true, message: "กรุณาเลือกกลุ่มชาติพันธุ์" }]}
              >
                <Select placeholder="เลือกกลุ่มชาติพันธุ์">
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="name" 
                label="ชื่อกลุ่มชาติพันธุ์"
                rules={[{ required: true, message: "กรุณากรอกชื่อกลุ่มชาติพันธุ์" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item 
                name="location" 
                label="ตำบล > อำเภอ > จังหวัด"
                rules={[{ required: true, message: "กรุณาเลือกตำบล" }]}
              >
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
                </Select>
              </Form.Item>

              <Form.Item name="district" label="ตำบล" rules={[{ required: true }]}>
                <Input readOnly />
              </Form.Item>
              <Form.Item name="amphoe" label="อำเภอ" rules={[{ required: true }]}>
                <Input readOnly />
              </Form.Item>
              <Form.Item name="province" label="จังหวัด" rules={[{ required: true }]}>
                <Input readOnly />
              </Form.Item>
              <Form.Item name="type" label="ภาค" rules={[{ required: true }]}>
                <Input readOnly />
              </Form.Item>

              <Form.Item name="village" label="หมู่บ้าน">
                <Input />
              </Form.Item>

              <Form.Item name="zipcode" label="รหัสไปรษณีย์" hidden>
                <InputNumber className="w-full" />
              </Form.Item>
              <Form.Item name="district_code" label="รหัสตำบล" hidden>
                <InputNumber className="w-full" />
              </Form.Item>
              <Form.Item name="amphoe_code" label="รหัสอำเภอ" hidden>
                <InputNumber className="w-full" />
              </Form.Item>
              <Form.Item name="province_code" label="รหัสจังหวัด" hidden>
                <InputNumber className="w-full" />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="ข้อมูลกิจกรรม" className="mb-4 border-green-200">
              <Form.Item 
                name="activityName" 
                label="ชื่อกิจกรรม"
                rules={[{ required: true, message: "กรุณากรอกชื่อกิจกรรม" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item 
                name="startYear" 
                label="ปีที่เริ่มดำเนินการ (พ.ศ.)"
                rules={[{ required: true, message: "กรุณากรอกปีที่เริ่มดำเนินการ" }]}
              >
                <InputNumber min={2400} max={2600} className="w-full" />
              </Form.Item>

              <Form.Item name="videoLink" label="ลิงก์วิดีโอประกอบ">
                <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
              </Form.Item>

              <Form.Item name="images" label="รูปภาพประกอบ">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleImageChange}
                  onRemove={handleRemoveImage}
                  beforeUpload={() => false}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    className="border-green-500 text-green-600 hover:border-green-600 hover:text-green-700"
                  >
                    อัพโหลดรูปภาพ
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item name="fileUrl" label="ไฟล์ประกอบ">
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
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Card title="รายละเอียด" className="mb-4 border-green-200">
          <Form.Item 
            name="history" 
            label="ประวัติ"
            rules={[{ required: true, message: "กรุณากรอกประวัติ" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item 
            name="activityOrigin" 
            label="ที่มาของกิจกรรม"
            rules={[{ required: true, message: "กรุณากรอกที่มาของกิจกรรม" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item 
            name="activityDetails" 
            label="รายละเอียดกิจกรรม"
            rules={[{ required: true, message: "กรุณากรอกรายละเอียดกิจกรรม" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item 
            name="alcoholFreeApproach" 
            label="แนวทางการจัดงานแบบปลอดเหล้า"
            rules={[{ required: true, message: "กรุณากรอกแนวทางการจัดงานแบบปลอดเหล้า" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="results" label="ผลลัพธ์">
            <TextArea rows={4} />
          </Form.Item>
        </Card>

        <Form.Item className="text-center">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending}
            className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
            size="large"
          >
            บันทึกการแก้ไข
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}