<template>
	<Modal v-drag-modal :mask-closable="false" width="700" v-model="modal$.show" :title="modal$.title">
		  <Row class="basic">
          <Col span="24" class="mt-2 mb-2">
              <Button type="primary" size="small" class="ml-2" icon="plus" v-per="'acm.add'" @click="addInfo">添加分类</Button>
              <RadioGroup v-model="content_type" type="button" size="small" style="margin-left:5px;">
                <Radio :label="0">资讯</Radio>
                <Radio :label="1">视频</Radio>
              </RadioGroup>
          </Col>
      </Row>        
      <div class="content-body">
		      <Table
          v-loading="'acm_cates'"
		      ref="table"
		      :page="pageIndex" 
		      :page-size="pageSize" 
		      :stripe="true" 
		      :show-header="true" 
		      :data="filter_data" 
		      :columns="columns" 
		      :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		      :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT"
		      > 
		      </Table>
      </div>                
      <div class="content-footer">
          <div class="clearfix">
              <Page 
              class="pull-right mt-2"
	        	  size="small"
              :total="total" 
              :current="pageIndex"
              :page-size="pageSize" 
              :show-sizer="true" 
              :show-total="true" 
              @on-change="pagenation" 
              @on-page-size-change="pagesize"
              >
              </Page>
          </div>
      </div>
  </Modal>
</template>

<script>
  import util from '@/libs/util'
  import grid from '@/libs/grid.mixin'
  import modal from '@/libs/modal.mixin'
  import common from '@/libs/common.mixin'
  import globals from '@/libs/globals.mixin'

  import expandRow from './table-expand'

  export default {
    mixins: [util, grid, modal, common, globals],
    components: {
      expandRow
    },
    data () {
      return {
        rest_api: 'acm_cates',
        pk: 'act_id',
        news_number: [],
        content_type: -1,
        filter_data: [],
        column_keys: {
          fold: {
            type: 'expand',
            width: 50,
            show: true
          },
					cate_name: {
						title: '分类名称',
            show: true,
					},
					content_type: {
						title: '分类类型',
						show: true,
          },
          status: {
            title: '状态',
            show: true,
          }
        },
        operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
					},
					del: {
						title: '删除',
						type: 'ios-trash',
					}
        },
        column_render: {
          fold(h, param) {
            let row = param.row.children_level
            return h(expandRow, {
              props: {
                row: row
              },
              on: {
              "on-success": () => {
                this.init_data()
              }
              }
            })
          },
          cate_name(h, param) {
						let cate_name =h('span', param.row.cate_name)
            return h('div', [cate_name])
          },
          content_type(h, param) {
						let content_type = h('span', param.row.content_type == 0 ? '资讯' : '视频')
						return h('div', [content_type])
          },
          status(h, param) {
            let status = h('span',{
              'class':param.row.status == 0?'text-danger':'text-success'
            },param.row.status == 0 ? '禁用' : '启用')
            return h('div', [status])
          }
				},
				operation_func:{
					edit(param) {
						this.editInfo(param.row)
					},
					del (param) {
						this.delInfo(param.row)
					}
				}
      }
    },
    mounted () {
      this.init_data()
    },
    computed: {
    },
    methods: {
      addInfo () {
        this.$Modal.open('app/acm/info-modal.vue', {
          on: {
            "on-success": () => {
              this.$emit('on-success')
              this.init_data()
            } 
          }
        })
        .then(modal => {
          modal.show('添加分类', 'add')
        })
      },
      editInfo (item) {
        this.$Modal.open('app/acm/info-modal.vue', {
          on: {
            "on-success": () => {
              this.$emit('on-success')
              this.init_data()
            } 
          }
        })
        .then(modal => {
          modal
            .set('item', item)
            .show('编辑内容', 'edit')
        })      
      },
      delInfo (param) {
        let children = param.children_level
        if(children.length !== 0){
          this.$Message.error('请先删除下级分类')
          return
        }
        let id = param.act_id
        this.$rest("acm_contents")
        .get({
          act_id: id
        })
        .success((response)=>{
          this.news_number = response.list
          if(this.news_number.length !== 0){
            this.$Message.error('请先删除分类内容')
            return
          }else {
            this.delete(id)
          }
        })
        .error((response)=>{
          this.error(response.body.message)
        })      
      },
      delete (id) {
        this.$rest("acm_cates")
        .delete(id)
        .success((response)=>{
            this.init_data()
            this.$emit('on-success')
            this.$Message.success('删除成功')
        })
        .error((response)=>{
            this.error(response.body.message)
        }) 
      },
      filterData (val) {
        if(val == -1){
          this.filter_data = this.data
        }else {
          let information = []
          this.data.forEach(i => {
            if(i.content_type == val){
              information.push(i)
            }
          })
          information.forEach(i => {
            i.children_level.filter(l => l.content_type === val)
          })
          information.forEach(i => {
            i.children_level.forEach(l => {
              l.children_level.filter(item => item.content_type === val)
            })
          })
          this.filter_data = information
          }
        }

    },
    watch: {
      'content_type': {
          handler:  function (val) {
              if(val == 0){
                this.filterData(val)
              }else if(val == 1){
                this.filterData(val)
              }
            },
            immediate: true
      },
      'data': function (val) {
        this.filterData(this.content_type)
      }
		},
  }
</script>

<style lang="less" scoped>
</style>