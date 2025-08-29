//dashboard/layout.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Drawer } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HistoryOutlined,
  FileProtectOutlined,
  CloseOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  TableOutlined

} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { HomeOutlined } from '@ant-design/icons';


const { Header, Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  
const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: 'Home' },
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/dashboard/users', icon: <UserOutlined />, label: 'Users' },
  {
    key: 'dataTables',
    icon: <TableOutlined />,
    label: 'Data Tables',
    children: [
      { key: '/dashboard/data-tables/traditions', label: 'งานบุญประเพณี' },
      { key: '/dashboard/data-tables/public-policies', label: 'นโยบายสาธารณะ' },
      { key: '/dashboard/data-tables/ethnic-groups', label: 'กลุ่มชาติพันธุ์' },
      { key: '/dashboard/data-tables/creative-activities', label: 'กิจกรรมสร้างสรรค์' },
    ],
  },
  
  // { key: '/dashboard/settings', icon: <SettingOutlined />, label: 'Settings' },
  {
    key: 'tradition',
    icon: <HistoryOutlined />,
    label: 'Tradition',
    children: [
      { key: '/dashboard/tradition-category', label: 'ชื่องานบุญประเพณี' },
      { key: '/dashboard/tradition', label: 'งานบุญประเพณีปลอดเหล้า' },
    ],
  },
  {
    key: 'creative',
    icon: <ExperimentOutlined />,
    label: 'Creative Activity',
    children: [
      { key: '/dashboard/creative-categories', label: 'หมวดหมู่กิจกรรมสร้างสรรค์' },
      { key: '/dashboard/creative-activity', label: 'กิจกรรมสร้างสรรค์' },
    ],
  },
  {
    key: 'ethnic',
    icon: <TeamOutlined />,
    label: 'Ethnic Group',
    children: [
      { key: '/dashboard/ethnic-category', label: 'ประเภทกลุ่มชาติพันธุ์' },
      { key: '/dashboard/ethnic-group', label: 'งานสุขภาวะในกลุ่มชาติพันธ์ุ' },
    ],
  },
  { key: '/dashboard/public-policy', icon: <FileProtectOutlined />, label: 'Public Policy' },
];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateSelectedKeys = () => {
      const matchingMenuItem = menuItems.find(item => 
        pathname === item.key || 
        (item.children && item.children.some(child => pathname === child.key))
      );
      if (matchingMenuItem) {
        if (matchingMenuItem.children) {
          setOpenKeys([matchingMenuItem.key]);
          const matchingChild = matchingMenuItem.children.find(child => pathname === child.key);
          if (matchingChild) {
            setSelectedKeys([matchingChild.key]);
          } else {
            setSelectedKeys([matchingMenuItem.key]);
          }
        } else {
          setSelectedKeys([matchingMenuItem.key]);
        }
      }
    };

    updateSelectedKeys();
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKeys([key]);
    router.push(key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const handleImageError = () => {
    setImageError(true);
    console.warn('Failed to load user avatar');
  };

  const userMenuItems = [
    {
      key: '0',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => router.push('/dashboard/profile')
    },
    {
      key: '1',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleSignOut
    }
  ];

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen"><div className="loading"></div></div>;
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const SiderContent = () => (
    <>
      <div className="logo p-4 flex justify-center items-center">
        <Link href="/" className="flex-shrink-0">
          <Image src="/power.png" alt="Logo" width={80} height={80} className="object-contain" />
        </Link>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        items={menuItems}
        className="border-r-0 custom-menu"
      />
    </>
  );

  return (
    <Layout className="min-h-screen bg-background">
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth="80"
          width={250}
          className="bg-white border-r border-muted custom-sider"
        >
          <SiderContent />
        </Sider>
      )}
      <Layout>
      <Header className="bg-white p-0 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="text-xl w-16 h-16 custom-button"
            />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-xl w-16 h-16 custom-button"
            />
          )}
      
        </div>
        <div className="flex items-center">
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <div className="flex items-center cursor-pointer mr-4">
                {session.user?.image && !imageError ? (
                  <img
                    src={session.user.image}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <Avatar icon={<UserOutlined />} className="rounded-full" style={{ width: 40, height: 40 }} />
                )}
                {/* <span className="ml-2 hidden md:inline text-foreground">{session.user?.firstName}</span> */}
              </div>
            </Dropdown>
        </div>
      </Header>
      <Content className="m-0 p-2 bg-white border-l-2 border-r-2">
          {/* <div className="mb-4 text-2xl font-bold text-foreground">
            {menuItems.find(item => item.key === selectedKeys[0])?.label || 
             menuItems.find(item => item.children?.some(child => child.key === selectedKeys[0]))?.children?.find(child => child.key === selectedKeys[0])?.label}
          </div> */}
          {children}
        </Content>
      </Layout>
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { padding: 0 } }}
          width={250}
        >
          <div className="flex justify-end p-4">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setDrawerVisible(false)}
              className="text-xl"
            />
          </div>
          <SiderContent />
        </Drawer>
      )}
    </Layout>
  );
}