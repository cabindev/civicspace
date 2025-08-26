// app/dashboard/public-policy/edit/[id]/components/EditPublicPolicyClient.tsx
'use client'

import React, { useState, useTransition } from 'react';
import { Form, Input, Select, DatePicker, Upload, Button, message, Card, Col, Row, Radio } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import type { UploadFile } from 'antd/es/upload/interface';
import moment from 'moment';
import 'moment/locale/th';
import imageCompression from 'browser-image-compression';

// Server Action
import { updatePublicPolicyDirect } from '@/app/lib/actions/public-policy/put';

const { Option } = Select;
const { TextArea } = Input;

moment.locale('th');

interface PublicPolicy {
  id: string;
  name: string;
  signingDate: string;
  level: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  content: string[] | string | Record<string, any>;
  summary: string;
  results?: string;
  images: { id: string; url: string }[];
  videoLink?: string;
  policyFileUrl?: string;
  zipcode?: number;
  district_code?: number;
  amphoe_code?: number;
  province_code?: number;
}

interface FormValues {
  name: string;
  signingDate: moment.Moment;
  level: string;
  district: string;
  amphoe: string;
  province: string;
  type: string;
  village?: string;
  content: string[];
  summary: string;
  results?: string;
  images?: UploadFile[];
  videoLink?: string;
  policyFile?: UploadFile;
  zipcode?: number;
  district_code?: number;
  amphoe_code?: number;
  province_code?: number;
  location?: string;
}

interface EditPublicPolicyClientProps {
  policy: PublicPolicy;
}

export default function EditPublicPolicyClient({ policy }: EditPublicPolicyClientProps) {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [fileList, setFileList] = useState<UploadFile[]>(() => 
    policy.images?.map((image, index) => ({
      uid: image.id || index.toString(),
      name: image.url.split('/').pop() || `image-${index}`,
      status: 'done' as const,
      url: image.url,
    })) || []
  );
  const [policyFile, setPolicyFile] = useState<UploadFile[]>(() => 
    policy.policyFileUrl ? [{
      uid: '-1',
      name: policy.policyFileUrl.split('/').pop() || 'file',
      status: 'done' as const,
      url: policy.policyFileUrl,
    }] : []
  );
  const [districts] = useState<string[]>(() => 
    Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)))
  );
  const [isPending, startTransition] = useTransition();

  // Pre-populate form with policy data
  React.useEffect(() => {
    let contentArray: string[] = [];
    
    if (Array.isArray(policy.content)) {
      contentArray = policy.content;
    } else if (typeof policy.content === 'string') {
      try {
        contentArray = JSON.parse(policy.content);
      } catch (e) {
        contentArray = [policy.content];
      }
    }

    const initialValues = {
      name: policy.name,
      signingDate: moment(policy.signingDate),
      level: policy.level,
      district: policy.district,
      amphoe: policy.amphoe,
      province: policy.province,
      type: policy.type,
      village: policy.village,
      content: contentArray,
      summary: policy.summary,
      results: policy.results,
      videoLink: policy.videoLink,
      zipcode: policy.zipcode,
      district_code: policy.district_code,
      amphoe_code: policy.amphoe_code,
      province_code: policy.province_code,
      location: `${policy.district}, ${policy.amphoe}, ${policy.province}`,
    };
    form.setFieldsValue(initialValues);
  }, [form, policy]);

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

  const onFinish = async (values: FormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        
        // Add all form values
        Object.entries(values).forEach(([key, value]) => {
          if (key === 'signingDate') {
            formData.append(key, (value as moment.Moment).toISOString());
          } else if (key === 'content' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key !== 'images' && key !== 'policyFile' && key !== 'location' && value !== undefined && value !== null) {
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
            formData.append('existingFile', policyFile[0].url);
          }
        } else {
          formData.append('removePolicyFile', 'true');
        }

        const result = await updatePublicPolicyDirect(policy.id, formData);
        
        if (result.success) {
          message.success('แก้ไขนโยบายสาธารณะสำเร็จ');
          router.push('/dashboard/public-policy');
        } else {
          message.error(result.error || 'ไม่สามารถแก้ไขนโยบายสาธารณะได้');
        }
      } catch (error) {
        console.error('Error updating policy:', error);
        message.error('ไม่สามารถแก้ไขนโยบายสาธารณะได้');
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-700">แก้ไขนโยบายสาธารณะ</h1>
      <Form<FormValues> 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4 border-green-200">
              <Form.Item 
                name="name" 
                label="ชื่อนโยบาย"
                rules={[{ required: true, message: "กรุณากรอกชื่อนโยบาย" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item 
                name="signingDate" 
                label="วันที่ลงนาม"
                rules={[{ required: true, message: "กรุณาเลือกวันที่ลงนาม" }]}
              >
                <DatePicker 
                  format="DD/MM/YYYY" 
                  className="w-full"
                  placeholder="เลือกวันที่ลงนาม"
                />
              </Form.Item>

              <Form.Item 
                name="level" 
                label="ระดับนโยบาย"
                rules={[{ required: true, message: "กรุณาเลือกระดับนโยบาย" }]}
              >
                <Select placeholder="เลือกระดับนโยบาย">
                  <Option value="NATIONAL">ระดับประเทศ</Option>
                  <Option value="HEALTH_REGION">ระดับเขตสุขภาพ</Option>
                  <Option value="PROVINCIAL">ระดับจังหวัด</Option>
                  <Option value="DISTRICT">ระดับอำเภอ</Option>
                  <Option value="SUB_DISTRICT">ระดับตำบล</Option>
                  <Option value="VILLAGE">ระดับหมู่บ้าน</Option>
                </Select>
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
                <Input />
              </Form.Item>
              <Form.Item name="district_code" label="รหัสตำบล" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="amphoe_code" label="รหัสอำเภอ" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="province_code" label="รหัสจังหวัด" hidden>
                <Input />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="เนื้อหาและรายละเอียด" className="mb-4 border-green-200">
              <Form.Item 
                name="content" 
                label="เนื้อหาของนโยบาย"
                rules={[{ required: true, message: "กรุณาเลือกเนื้อหาของนโยบาย" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="เลือกเนื้อหาของนโยบาย (เลือกได้หลายรายการ)"
                >
                  <Option value="LAW_ENFORCEMENT">การบังคับใช้กฎหมาย</Option>
                  <Option value="ALCOHOL_FREE_TRADITION">บุญประเพณีปลอดเหล้า</Option>
                  <Option value="ALCOHOL_FREE_MERIT">งานบุญปลอดเหล้า</Option>
                  <Option value="CHILD_YOUTH_PROTECTION">การปกป้องเด็กและเยาวชน</Option>
                  <Option value="CREATIVE_SPACE">พื้นที่สร้างสรรค์</Option>
                </Select>
              </Form.Item>

              <Form.Item 
                name="summary" 
                label="สรุป"
                rules={[{ required: true, message: "กรุณากรอกสรุป" }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="results" label="ผลลัพธ์">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="videoLink" label="ลิงก์วิดีโอประกอบ">
                <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
              </Form.Item>

              <Form.Item name="images" label="รูปภาพประกอบ">
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
              </Form.Item>

              <Form.Item name="policyFile" label="ไฟล์นโยบาย">
                <Upload
                  fileList={policyFile}
                  onChange={({ fileList }) => setPolicyFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    className="border-green-500 text-green-600 hover:border-green-600 hover:text-green-700"
                  >
                    อัพโหลดไฟล์นโยบาย
                  </Button>
                </Upload>
              </Form.Item>
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
            บันทึกการแก้ไข
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}