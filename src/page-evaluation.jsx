import React, { useEffect, useMemo, useState } from 'react';
import { Col, Row, Select, Space, Spin, Table, message } from 'antd';

import { SiteFooter, SiteHeader } from './components.jsx';

const EVAL_API_BASE =
  process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8001' : '';

const SUB_CATEGORY_KEYS = [
  { key: 'intent', label: 'Intent' },
  { key: 'object', label: 'Object' },
  { key: 'methodology', label: 'Methodology' },
];

function collectUniqueCategoryValues(papers, categoryKey) {
  const set = new Set();
  for (const p of papers) {
    const arr = p.category?.[categoryKey];
    if (Array.isArray(arr)) {
      for (const v of arr) {
        if (v != null && v !== '') set.add(v);
      }
    }
  }
  return [...set].sort((a, b) => String(a).localeCompare(String(b)));
}

function categoryIncludes(paper, categoryKey, value) {
  if (value == null || value === '') return true;
  const arr = paper.category?.[categoryKey];
  return Array.isArray(arr) && arr.includes(value);
}

function matchesPresentation(paper, presentation) {
  const arr = paper.category?.presentation;
  return Array.isArray(arr) && arr.includes(presentation);
}

const filterPanelClass = {
  main:
    'rounded-lg border-2 border-[#0B54D8] bg-blue-50/90 dark:bg-blue-950/35 dark:border-[#17B8FF] p-3',
  sub:
    'rounded-lg border-2 border-neutral-300 bg-neutral-100/90 dark:bg-neutral-800/80 dark:border-neutral-600 p-3',
};

const filterBadgeClass = {
  main: 'inline-block rounded-md bg-[#0B54D8] dark:bg-[#0B54D8] px-2 py-0.5 text-xs font-semibold tracking-wide text-white mb-2',
  sub: 'inline-block rounded-md bg-neutral-500 dark:bg-neutral-600 px-2 py-0.5 text-xs font-semibold tracking-wide text-white mb-2',
};

const EvaluationPage = () => {
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState([]);
  const [presentation, setPresentation] = useState(undefined);
  const [subFilters, setSubFilters] = useState({
    intent: undefined,
    object: undefined,
    methodology: undefined,
  });
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const url = `${EVAL_API_BASE}/papers`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.papers) ? data.papers : Array.isArray(data) ? data : [];
        if (!cancelled) setPapers(list);
      } catch (e) {
        console.error(e);
        messageApi.error('Failed to load papers.');
        if (!cancelled) setPapers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [messageApi]);

  const presentationOptions = useMemo(
    () => collectUniqueCategoryValues(papers, 'presentation'),
    [papers],
  );

  const subOptions = useMemo(() => {
    const out = {};
    for (const { key } of SUB_CATEGORY_KEYS) {
      out[key] = collectUniqueCategoryValues(papers, key);
    }
    return out;
  }, [papers]);

  const filteredPapers = useMemo(() => {
    if (presentation == null || presentation === '') return [];
    return papers.filter(
      p =>
        matchesPresentation(p, presentation) &&
        categoryIncludes(p, 'intent', subFilters.intent) &&
        categoryIncludes(p, 'object', subFilters.object) &&
        categoryIncludes(p, 'methodology', subFilters.methodology),
    );
  }, [papers, presentation, subFilters]);

  const columns = useMemo(
    () => [
      { title: 'Method', dataIndex: 'method', key: 'method', ellipsis: true },
      { title: 'Source', dataIndex: 'source', key: 'source', ellipsis: true },
      { title: 'Year', dataIndex: 'year', key: 'year', width: 88 },
      {
        title: 'Paper',
        key: 'paper_url',
        width: 100,
        render: (_, row) => (
          <a
            className='text-blue-600 dark:text-blue-400'
            href={row.paper_url}
            target='_blank'
            rel='noopener noreferrer'
          >
            Open
          </a>
        ),
      },
    ],
    [],
  );

  const showTable = presentation != null && presentation !== '';

  return (
    <>
      {contextHolder}
      <SiteHeader badge='EVAL' />
      <Spin spinning={loading} wrapperClassName='w-full min-w-0'>
        <div className='bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-lg shadow-md dark:shadow-neutral-950/40 p-2 w-full min-w-0 overflow-x-auto'>
          <div className='p-4'>
            <Space className='w-full' direction='vertical' size='middle'>
              <div>
                <p className='mb-2'>Model evaluation</p>
                <p className='text-neutral-500 dark:text-neutral-400 text-sm mb-4'>
                  Filter XAI methods by presentation (required) and optional category dimensions.
                </p>
                <Row gutter={[16, 16]} align='stretch'>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <div className={filterPanelClass.main}>
                      <div className={filterBadgeClass.main}>Presentation</div>
                      <Select
                        className='w-full min-w-[160px]'
                        placeholder='Unselected'
                        allowClear
                        value={presentation}
                        onChange={v => {
                          setPresentation(v);
                        }}
                        options={presentationOptions.map(v => ({ label: v, value: v }))}
                      />
                    </div>
                  </Col>
                  {SUB_CATEGORY_KEYS.map(({ key, label }) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={key}>
                      <div className={filterPanelClass.sub}>
                        <div className={filterBadgeClass.sub}>{label}</div>
                        <Select
                          className='w-full min-w-[160px]'
                          placeholder='Unselected'
                          allowClear
                          value={subFilters[key]}
                          onChange={v =>
                            setSubFilters(prev => ({
                              ...prev,
                              [key]: v,
                            }))
                          }
                          options={subOptions[key]?.map(v => ({ label: v, value: v })) ?? []}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
              {showTable && (
                <Table
                  className='dark:[&_.ant-table]:bg-neutral-900'
                  size='small'
                  rowKey={r => r.id ?? `${r.method}-${r.source}-${r.year}`}
                  columns={columns}
                  dataSource={filteredPapers}
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                  locale={{ emptyText: 'No methods match the current filters.' }}
                />
              )}
            </Space>
          </div>
        </div>
      </Spin>
      <SiteFooter />
    </>
  );
};

export default EvaluationPage;
