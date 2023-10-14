PageHeader组件可以用于突出页面主题，显示与页面相关的重要信息，并承载与当前页面相关的操作项（包括页面级操作、页面间导航等）。它还可以用作页面间导航。

[参考文档](https://github.com/ant-design/pro-components/blob/master/packages/layout/src/components/PageHeader/index.en-US.md

PageHeader位于页容器中，页容器顶部，起到了内容概览和引导页级操作的作用。它由面包屑、标题、页面内容简介、页面级操作等组成。[参考文档](https://github.com/ant-design/pro-components/blob/master/packages/layout/src/components/PageHeader/index.md

PageContainer组件封装了ant design的PageHeader组件，并增加了tabList和content属性。它依赖Layout的route属性，可以根据当前的路由填入title和breadcrumb。PageContainer支持Tabs和PageHeader的所有属性。[参考文档](https://github.com/ant-design/pro-components/blob/master/packages/layout/src/components/PageContainer/index.md

可能的原因是PageContainer存在tabList属性，第一次打开页面时可能会出现不显示整个pageHeader的情况，需要刷新页面才会出现Header。[参考文档](https://github.com/ant-design/pro-components/issues/3299)
