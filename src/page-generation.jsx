import React, { useState } from 'react';
import { Menu, Spin, message } from 'antd';
import { AimOutlined, CrownOutlined, MessageOutlined, TagsOutlined } from '@ant-design/icons';

import LocalizationPage from './page-localization.jsx';
import SemanticPage from './page-semantic.jsx';
import ComprehensivePage from './page-comprehensive.jsx';
import VLMPage from './page-vlm.jsx';
import { SiteFooter, SiteHeader } from './components.jsx';

const pageItems = [
  {
    label: 'Localization Interpret.',
    key: 'localization',
    icon: <AimOutlined />,
  },
  {
    label: 'Semantic Interpret.',
    key: 'semantic',
    icon: <TagsOutlined />,
  },
  {
    label: 'Comprehensive Interpret.',
    key: 'comprehensive',
    icon: <CrownOutlined />,
  },
  {
    label: 'VLM Interpret.',
    key: 'vlm',
    icon: <MessageOutlined />,
  },
];

const pageComponent = (page_id, props) => {
  switch (page_id) {
    case 'localization':
      return <LocalizationPage {...props} />;
    case 'semantic':
      return <SemanticPage {...props} />;
    case 'comprehensive':
      return <ComprehensivePage {...props} />;
    case 'vlm':
      return <VLMPage {...props} />;
    default:
      return null;
  }
};

const GenerationPage = () => {
  const [currentPage, setCurrentPage] = useState('localization');
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <SiteHeader badge='GEN' />
      <Spin spinning={loading} wrapperClassName='w-full min-w-0'>
        <div className='bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-lg shadow-md dark:shadow-neutral-950/40 p-2 w-full min-w-0 overflow-x-auto'>
          <Menu onClick={(e) => setCurrentPage(e.key)} selectedKeys={[currentPage]} mode='horizontal' items={pageItems} />
          <div className='p-4'>
            {pageComponent(currentPage, { setLoading, messageApi })}
          </div>
        </div>
      </Spin>
      <SiteFooter />
    </>
  );
};

export default GenerationPage;
