<template>
  <div class="c-grid">
      <div class="box box-query">
          <Form :label-width="80" ref="form" :model="search_field" class="filter-form row">
              <Form-item label="标题" prop="title" class="col-md-4 col-sm-4">
					        <Input v-model="search_field.title" placeholder="请输入标题" @keyup.native.enter="init_data"
                  />
				      </Form-item>
              <Form-item label="作者" prop="author" class="col-md-4 col-sm-4">
					        <Input v-model="search_field.author" placeholder="请输入作者名称" @keyup.native.enter="init_data"
                  />
				      </Form-item>    
              <Form-item label="分类" prop="act_ids" class="col-md-4 col-sm-4">
                  <Cascader :data="cascader_list" v-model="act_ids" change-on-select></Cascader>
				      </Form-item>              
          </Form>
	        <Row class="basic">
              <Col span="24" class="mt-2" style="margin-left:0px;">
                <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
              	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
              </Col>
          </Row>
      </div>
      <div class="box box-result">
        <div class="content">
          	<div class="toolbar">
                <Button type="primary" icon="plus" @click="addInfo"  title="请先添加分类">添加内容</Button> 
                <Button type="ghost" icon="gear-b" @click="lookUpType" style="margin-left:5px;">分类设置</Button>
	      		</div> 
          <div class="content-body">
            <div class="text-center" v-if="loading">正在加载数据...</div>
            <template v-else>
            <div class="empty" v-if="data.length == 0" style="text-align:center;"><p>无数据...</p></div>
            <div v-for="item in data" :key="item.ac_id" class="news-content" v-else>
              <div class="img">
                <img :src="item.cover_img_url" alt="">
              </div>
              <div class="cs-content">
                <h3 class="title">{{item.title}}</h3>
                <div class="author">作者：{{item.author}}</div>
                <div>简介：{{item.desc}}</div>
                <div class="recommend" v-if="item.is_recommend">
                  <Icon type="star" :size="30"></Icon>
                </div>
                <div class="views">
                  <Icon type="eye"></Icon>
                  {{item.views}}
                </div>
                <div class="pull-right" style="margin-bottom: 5px">
                <Dropdown placement="bottom-start">
                  <Button type="primary">
                      操作
                      <Icon type="arrow-down-b"></Icon>
                  </Button>
                  <DropdownMenu slot="list">
                      <DropdownItem @click.native="editInfo(item)">
                        <Icon type="edit" />  
                          编辑
                      </DropdownItem>
                      <DropdownItem @click.native="delInfo(item)">
                        <Icon type="ios-trash" />
                          删除
                      </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                </div>
              </div>              
            </div>
            </template>  
          </div>
          <div class="content-footer">
              <div class="pagenation">
                  <Page 
                  :total="total" 
                  :current="pageIndex"
                  :page-size="pageSize" 
                  :show-total="true" 
                  @on-change="pagenation" 
                  @on-page-size-change="pagesize"
                  >
                  </Page>
              </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
  import util from '@/libs/util'
  import grid from '@/libs/grid.mixin'
  import common from '@/libs/common.mixin'
  import globals from '@/libs/globals.mixin'

  export default {
    mixins: [util, grid, common, globals],
    data () {
      return {
        rest_api: 'acm_contents',
        pk: 'act_id',
        cate_name_list: [],
        cascader_list: [],
        act_ids: [],
        search_field: {
          title: '',
          act_id: 0,
          author: '',
        },     
      }
    },
    watch: {
      "act_ids": function(val) {
        let value = val.slice(-1)[0]
        this.search_field.act_id = value
      }
    },
    mounted() {
      this.init_data()
      this.init_cate_name()
    },
    methods: {
      init_cate_name () {
        this.$rest("acm_cates")
          .get()
          .success((response)=>{
            let emptyArray = []           
            this.cate_name_list = response.list
            this.cascader_list = []
            response.list.forEach(i => {
              this.cascader_list.push({
                value: i.act_id,
                label: i.cate_name,
                array: i.children_level,
                children: []    
              })
            })
            this.cascader_list.forEach(i => {
              i.array.forEach(l => {
                i.children.push({
                  value: l.act_id,
                  label: l.cate_name,
                  array: l.children_level,
                  children: []                 
                })
              })
            })
            this.cascader_list.forEach(i => {
              i.children.forEach(l => {
                l.array.forEach(item =>{
                  l.children.push({
                    value: item.act_id,
                    label: item.cate_name,                    
                  })
                })
              })
            })            
            this.cascader_list.unshift({
              value: 0,
              label: '顶级'
            })
          })
          .error((response)=>{
            this.error(response.body.message)
        })
      },
      resetSearch () {
				this.$r('form').resetFields()
				this.init_data()
      },
      addInfo () {
            this.$Modal.open('app/acm/acm-info-modal.vue', {
              on: {
                "on-success": () => {
                    this.init_data()
                } 
              }
            })
            .then(modal => {
              modal
              .set('type_list', this.cascader_list.slice(1))
              .set('cate_name_list', this.cate_name_list)
              .show('添加内容', 'add')
            })            
      },
      editInfo (item) {
        this.$Modal.open('app/acm/acm-info-modal.vue', {
          on: {
            "on-success": () => {
              this.init_data()
            } 
          }
        })
        .then(modal => {
          modal
            .set('type_list', this.cascader_list.slice(1))
            .set('item', item) 
            .show('编辑内容', 'edit')
        })      
      },
      lookUpType () {
        let title = '分类类型'
        this.$Modal.open('app/acm/type-modal.vue',{
          on: {
            'on-success': () => {
              this.init_cate_name()
            }
          }
        })
        .then(modal => {
          modal
          .set('filter_data', this.cate_name_list)
          .show(title)
        })
      },
      delInfo (item) {
        let uri = `acm_contents`,
        id = item.ac_id
        this.$rest(uri)
        .delete(id)
        .success((response)=>{
            this.init_data()
            this.$Message.success('删除成功')
        })
        .error((response)=>{
            this.error(response.body.message)
        })        
      },
      hook_get_param (params) {
        let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property&&property!=-1){
							params[o] = property	
					}
				}
      }
    },
    computed: {
      show_data () {
        return this.data.filter(item => item.status == 1)
      }
    }
  }
</script>

<style lang="less" scoped>
  div.news-content {
    position: relative;
    margin: 10px 0;
    border-bottom: 1px solid #ccc;
    .img {
      width: 8%;
	    height: 100%;
      display: inline-block;
      vertical-align: top;
      position: relative;
      margin-bottom: 5px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .cs-content {
      display: inline-block;
      vertical-align: top;
      width: 90%;
      height: 100%;
      color: #657180;
      position: relative;
      margin-left: 10px;
      .title {
        font-size: 18px;
        color: #333;
        font-weight: 700;
        margin-bottom: 5px;
        word-break: break-all   
      }
      .author {
        font-size: 16px;
        margin-bottom: 5px;
      }
      .views {
        position: absolute;
        right: 63px;
        bottom: 7px;
      }
      .recommend {
        position: absolute;
        right: -16px;
        top: -2px;
      }
    }
  }
</style>