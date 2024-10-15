'use client'

import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Upload, Button, message, Card, Col, Row, Radio } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { data } from '@/app/data/regions';
import type { UploadFile } from 'antd/es/upload/interface';
import moment from 'moment';
import 'moment/locale/th';

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
}

interface RegionData {
  district: string;
  amphoe: string;
  province: string;
  type: string;
  zipcode: number | null;
  district_code: number | null;
  amphoe_code: number | null;
  province_code: number | null;
}

export default function CreatePublicPolicy() {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [policyFile, setPolicyFile] = useState<UploadFile[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const uniqueDistricts = Array.from(new Set(data.map(item => `${item.district}, ${item.amphoe}, ${item.province}`)));
    setDistricts(uniqueDistricts);
  }, []);

  const handleDistrictChange = (value: string) => {
    const [district, amphoe, province] = value.split(', ');
    const regionData = data.find(d => d.district === district && d.amphoe === amphoe && d.province === province);
    if (regionData) {
      const formValues: any = {
        district: regionData.district,
        amphoe: regionData.amphoe,
        province: regionData.province,
        type: regionData.type,
      };

      const filledFields = new Set(['district', 'amphoe', 'province', 'type']);

      if (regionData.zipcode !== null) {
        formValues.zipcode = regionData.zipcode;
        filledFields.add('zipcode');
      }
      if (regionData.district_code !== null) {
        formValues.district_code = regionData.district_code;
        filledFields.add('district_code');
      }
      if (regionData.amphoe_code !== null) {
        formValues.amphoe_code = regionData.amphoe_code;
        filledFields.add('amphoe_code');
      }
      if (regionData.province_code !== null) {
        formValues.province_code = regionData.province_code;
        filledFields.add('province_code');
      }

      form.setFieldsValue(formValues);
      setAutoFilledFields(filledFields);
    }
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
        } else if (key === 'policyFile' && policyFile.length > 0) {
          formData.append('policyFile', policyFile[0].originFileObj as File);
        } else if (key === 'content') {
          formData.append('content', JSON.stringify(value));
        } else if (key === 'signingDate') {
          formData.append('signingDate', value.toISOString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      await axios.post('/api/public-policy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('สร้างนโยบายสาธารณะสำเร็จ');
      router.push('/dashboard/public-policy');
    } catch (error) {
      console.error('Error creating public policy:', error);
      message.error('ไม่สามารถสร้างนโยบายสาธารณะได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <style jsx global>{`
        .auto-filled .ant-input,
        .auto-filled .ant-select-selector {
          background-color: #e6f7e6 !important;
        }
      `}</style>
      <h1 className="text-2xl font-bold mb-4">สร้างนโยบายสาธารณะใหม่</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
                  disabledDate={(current) => current && current > moment().endOf('day')}
                />
              </Form.Item>

              <Form.Item name="level" label="ระดับของนโยบาย" rules={[{ required: true, message: 'กรุณาเลือกระดับของนโยบาย' }]}>
                <Radio.Group>
                  <Radio value="NATIONAL">ระดับประเทศ</Radio>
                  <Radio value="PROVINCIAL">ระดับจังหวัด</Radio>
                  <Radio value="DISTRICT">ระดับอำเภอ</Radio>
                  <Radio value="SUB_DISTRICT">ระดับตำบล</Radio>
                  <Radio value="VILLAGE">ระดับหมู่บ้าน</Radio>
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

              <Form.Item name="district" className={autoFilledFields.has('district') ? 'auto-filled' : ''}>
                <Input readOnly />
              </Form.Item>
              <Form.Item name="amphoe" className={autoFilledFields.has('amphoe') ? 'auto-filled' : ''}>
                <Input readOnly />
              </Form.Item>
              <Form.Item name="province" className={autoFilledFields.has('province') ? 'auto-filled' : ''}>
                <Input readOnly />
              </Form.Item>
              <Form.Item name="type" className={autoFilledFields.has('type') ? 'auto-filled' : ''}>
                <Input readOnly />
              </Form.Item>
              <Form.Item name="zipcode" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="district_code" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="amphoe_code" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="province_code" hidden>
                <Input />
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
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>อัพโหลดรูปภาพ</Button>
                </Upload>
              </Form.Item>
              <p className="mb-4">จำนวนรูปภาพที่เลือก: {fileList.length} (สามารถเลือกได้หลายรูป)</p>

              <Form.Item name="videoLink" label="แนบ Link VDO ประกอบ">
                <Input prefix={<LinkOutlined />} placeholder="https://www.example.com/video" />
              </Form.Item>

              <Form.Item name="policyFile" label="แนบไฟล์นโยบายประกอบ">
                <Upload
                  fileList={policyFile}
                  onChange={({ fileList }) => setPolicyFile(fileList)}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>อัพโหลดไฟล์นโยบาย</Button>
                </Upload>
              </Form.Item>
              {policyFile.length > 0 && <p>ไฟล์ที่เลือก: {policyFile[0].name}</p>}
            </Card>
          </Col>
        </Row>

        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit" loading={loading}>
            สร้างนโยบายสาธารณะ
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}