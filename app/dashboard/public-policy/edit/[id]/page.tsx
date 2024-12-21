// app/dashboard/public-policy/edit/[id]/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, DatePicker, Upload, Button, message, Card, Col, Row, Radio } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import type { UploadFile } from 'antd/es/upload/interface';
import moment from 'moment';
import 'moment/locale/th';
import imageCompression from 'browser-image-compression';
import type { UploadProps } from 'antd/es/upload/interface';

const { Option } = Select;
const { TextArea } = Input;

moment.locale('th');

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

export default function EditPublicPolicy({ params }: { params: { id: string } }) {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [policyFile, setPolicyFile] = useState<UploadFile[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);

  const fetchPolicy = useCallback(async () => {
    try {
      const response = await axios.get(`/api/public-policy/${params.id}`);
      const policy = response.data;
      const formattedPolicy = {
        ...policy,
        signingDate: moment(policy.signingDate),
        content: Array.isArray(policy.content) ? policy.content : JSON.parse(policy.content),
        location: `${policy.district}, ${policy.amphoe}, ${policy.province}`,
      };
      setInitialValues(formattedPolicy);
      form.setFieldsValue(formattedPolicy);
      setFileList(policy.images?.map((image: any) => ({
        uid: image.id,
        name: image.url.split('/').pop(),
        status: 'done',
        url: image.url,
      })) || []);
      if (policy.policyFileUrl) {
        setPolicyFile([{
          uid: '-1',
          name: policy.policyFileUrl.split('/').pop(),
          status: 'done',
          url: policy.policyFileUrl,
        }]);
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
      message.error('ไม่สามารถโหลดข้อมูลนโยบายได้');
    }
  }, [params.id, form]);

  useEffect(() => {
    fetchPolicy();
    const uniqueDistricts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));
    setDistricts(uniqueDistricts);
  }, [fetchPolicy]);
  
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

  const handleImageChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    const processedFileList = await Promise.all(
      newFileList.map(async (file) => {
        if (file.originFileObj) {
          const isJpgOrPngOrWebp = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
          if (!isJpgOrPngOrWebp) {
            message.error(`ไฟล์ ${file.name} ไม่ใช่ไฟล์ JPG, PNG หรือ WebP`);
            return null;
          }
  
          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: 'image/webp' as const,
          };
  
          try {
            let compressedFile = await imageCompression(file.originFileObj, options);
            while (compressedFile.size > 200 * 1024) {
              options.maxSizeMB *= 0.9;
              compressedFile = await imageCompression(file.originFileObj, options);
            }
  
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
  
    const filteredFileList = processedFileList.filter((file): file is UploadFile => file !== null);
    setFileList(filteredFileList.slice(-8));  // Limit to 8 images
  };

  const handleRemoveImage = (file: UploadFile) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
  };
  
  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'content') {
          formData.append(key, JSON.stringify(value));  // Stringify the content array
        } else if (key !== 'images' && key !== 'policyFile' && value !== undefined && value !== null) {
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

      await axios.put(`/api/public-policy/${params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('อัปเดตนโยบายสาธารณะสำเร็จ');
      router.push('/dashboard/public-policy');
    } catch (error) {
      console.error('Error updating public policy:', error);
      message.error('ไม่สามารถอัปเดตนโยบายสาธารณะได้');
    } finally {
      setLoading(false);
    }
  };
  

  if (!initialValues) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขนโยบายสาธารณะ</h1>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="ข้อมูลทั่วไป" className="mb-4">
              <Form.Item name="name" label="ชื่อนโยบาย" rules={[{ required: true, message: 'กรุณากรอกชื่อนโยบาย' }]}>
                <Input />
              </Form.Item>

              <Form.Item name="signingDate" label="วันที่ลงนาม/MOU" rules={[{ required: true, message: 'กรุณาเลือกวันที่ลงนาม' }]}>
                <DatePicker 
                  format="DD/MM/YYYY"
                  className="w-full"
                  placeholder="เลือกวันที่"
                />
              </Form.Item>

              <Form.Item 
                name="level" 
                label="ระดับของนโยบาย" 
                rules={[{ required: true, message: 'กรุณาเลือกระดับของนโยบาย' }]}
              >
                <Radio.Group>
                  <div className="space-y-2">
                    <Radio value="NATIONAL">ระดับประเทศ</Radio>
                    <Radio value="HEALTH_REGION">ระดับเขตสุขภาพ</Radio>
                    <Radio value="PROVINCIAL">ระดับจังหวัด</Radio>
                    <Radio value="DISTRICT">ระดับอำเภอ</Radio>
                    <Radio value="SUB_DISTRICT">ระดับตำบล</Radio>
                    <Radio value="VILLAGE">ระดับหมู่บ้าน</Radio>
                  </div>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="location" label="พื้นที่ดำเนินการ" rules={[{ required: true, message: 'กรุณาเลือกพื้นที่ดำเนินการ' }]}>
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
                <Input readOnly className="bg-green-50" />
              </Form.Item>
              <Form.Item name="amphoe" label="อำเภอ">
                <Input readOnly className="bg-green-50" />
              </Form.Item>
              <Form.Item name="province" label="จังหวัด">
                <Input readOnly className="bg-green-50" />
              </Form.Item>
              <Form.Item name="type" label="ภาค">
                <Input readOnly className="bg-green-50" />
              </Form.Item>
              <Form.Item name="zipcode" label="รหัสไปรษณีย์">
                <Input readOnly className="bg-green-50" />
              </Form.Item>
              <Form.Item name="district_code" label="รหัสตำบล">
                <Input readOnly className="bg-green-50" />
              </Form.Item>
              <Form.Item name="amphoe_code" label="รหัสอำเภอ">
                <Input readOnly className="bg-green-50" />
              </Form.Item>
              <Form.Item name="province_code" label="รหัสจังหวัด">
                <Input readOnly className="bg-green-50" />
              </Form.Item>

              <Form.Item name="village" label="หมู่บ้าน">
                <Input />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="รายละเอียด" className="mb-4">
              <Form.Item name="content" label="เนื้อหาของนโยบาย" rules={[{ required: true, message: 'กรุณาเลือกเนื้อหาของนโยบาย' }]}>
                <Select mode="multiple">
                  <Option value="LAW_ENFORCEMENT">การบังคับใช้กฎหมาย</Option>
                  <Option value="ALCOHOL_FREE_TRADITION">บุญประเพณีปลอดเหล้า</Option>
                  <Option value="ALCOHOL_FREE_MERIT">งานบุญปลอดเหล้า</Option>
                  <Option value="CHILD_YOUTH_PROTECTION">การปกป้องเด็กและเยาวชน</Option>
                  <Option value="CREATIVE_SPACE">พื้นที่สร้างสรรค์</Option>
                </Select>
              </Form.Item>

              <Form.Item name="summary" label="สรุปบรรยายเนื้อหาของนโยบาย" rules={[{ required: true, message: 'กรุณากรอกสรุปเนื้อหาของนโยบาย' }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="results" label="ผลการดำเนินการของนโยบาย">
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
                {fileList.length >= 8 ? null :  <Button icon={<UploadOutlined />}>อัพโหลดรูปภาพ</Button>}
</Upload>
</Form.Item>
<p className="mb-4">จำนวนรูปภาพที่เลือก: {fileList.length} (สามารถเลือกได้สูงสุด 8 รูป)</p>
Copy          <Form.Item name="videoLink" label="แนบ Link VDO ประกอบ">
            <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
          </Form.Item>

          <Form.Item name="policyFile" label="แนบไฟล์นโยบายประกอบ">
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
        อัปเดตนโยบายสาธารณะ
      </Button>
    </Form.Item>
  </Form>
</div>
);
}