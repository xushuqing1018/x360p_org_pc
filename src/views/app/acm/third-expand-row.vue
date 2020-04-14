<style scoped>
  .ivu-table-wrapper {
    min-height: 0;
  }
</style>

<template>
  <div>
		<Table 
		  	:stripe="true" 
		  	:show-header="false" 
		  	:data="row" 
		  	:columns="columns" 
		  	:no-data-text="'暂无下级分类'" 
		  	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT"
		  	> 
		</Table>
  </div>
</template>

<script>
  import util from '@/libs/util'
  import grid from '@/libs/grid.mixin'
  import common from '@/libs/common.mixin'
  import globals from '@/libs/globals.mixin'



  export default {
    mixins: [util, grid, common, globals],
    props: {
      row: Array
    },
    data () {
      return {
        column_keys: {
          empty: {
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
          empty(h, param) {
            return h('div', "")
          },
          cate_name(h, param) {
						let cate_name = h('span', param.row.cate_name)
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
    computed: {
    },
    methods: {
      editInfo (item) {
        this.$Modal.open('app/acm/info-modal.vue', {
          on: {
            "on-success": () => {
                this.$emit('on-success')
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
            this.$emit("on-success")
            this.$Message.success('删除成功')
        })
        .error((response)=>{
            this.error(response.body.message)
        }) 
      }
    },
    watch: {
		},
  }
</script>

<style>
  td.ivu-table-expanded-cell {
    padding: 0 10px !important;
  }
  .ivu-select-dropdown {
    z-index: 2021;
  }
</style>

