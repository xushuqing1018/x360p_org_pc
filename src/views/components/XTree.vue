<template>
    <div :class="classes" role="tree" onselectstart="return false" style="max-height: 550px;overflow: auto;">
        <ul :class="containerClasses" role="group">
            <x-tree-item v-for="(child, index) in data"
                       :search-key="searchKey"
                       :key="index"
                       :data="child"
                       :sel-ids="selIds"
                       :whole-row="wholeRow"
                       :show-checkbox="showCheckbox"
                       :height="sizeHight"
                       :parent-item="data"
                       :draggable="draggable"
                       :on-item-click="onItemClick"
                       :on-item-toggle="onItemToggle"
                       :on-item-drag-start="onItemDragStart"
                       :on-item-drag-end="onItemDragEnd"
                       :on-item-drop="onItemDrop"
                       :klass="index === data.length-1?'tree-last':''">
            </x-tree-item>
        </ul>
    </div>
</template>
<script>
  import XTreeItem from './XTreeItem.vue'
  import { findComponentsDownward } from '@/libs/assist'
  import util from '@/libs/util'

  let ITEM_ID = 0
  let ITEM_HEIGHT_SMALL = 18
  let ITEM_HEIGHT_DEFAULT = 24
  let ITEM_HEIGHT_LARGE = 32

  export default {
    name: 'XTree',
    props: {
      selIds: {type: [Array,String,Number]},
      data: {type: Array},
      size: {type: String, validator: value => ['large', 'small'].indexOf(value) > -1},
      showCheckbox: {type: Boolean, default: false},
      wholeRow: {type: Boolean, default: false},
      noDots: {type: Boolean, default: false},
      multiple: {type: Boolean, default: false},
      allowBatch: {type: Boolean, default: false},
      textFieldName: {type: String, default: 'text'},
      valueFieldName: {type: String, default: 'value'},
      async: {type: Function},
      loadingText: {type: String, default: 'Loading...'},
      draggable: {type: Boolean, default: false},
      klass: String,
      searchKey: {type: String, default :''}
    },
    data () {
      return {
        draggedItem: null
      }
    },
    computed: {
      classes () {
        return [
          {'tree': true},
          {'tree-default': !this.size},
          {[`tree-default-${this.size}`]: !!this.size},
          {'tree-checkbox-selection': !!this.showCheckbox},
          {[this.klass]: !!this.klass}
        ]
      },
      containerClasses () {
        return [
          {'tree-container-ul': true},
          {'tree-children': true},
          {'tree-wholerow-ul': !!this.wholeRow},
          {'tree-no-dots': !!this.noDots}
        ]
      },
      sizeHight () {
        switch (this.size) {
          case 'large':
            return ITEM_HEIGHT_LARGE
          case 'small':
            return ITEM_HEIGHT_SMALL
          default:
            return ITEM_HEIGHT_DEFAULT
        }
      }
    },
    methods: {
      initializeData (items) {
        if (items && items.length > 0) {
          for (let i=0,l=items.length;i<l;i++) {
            var dataItem = this.initializeDataItem(items[i])
            items[i] = dataItem
            if(typeof items[i].children != 'undefined' && items[i].children.length > 0){
              this.initializeData(items[i].children)
            }
          }
        }
      },
      initializeDataItem (item) {
        function Model(item, textFieldName, valueFieldName) {
          this.id = item.id || ITEM_ID++
          this.text = item[textFieldName] || ''
          this.value= item[valueFieldName] || item[textFieldName]
          this.icon = item.icon || ''
          this.color = item.color || ''
          this.opened = item.opened || false
          this.selected = item.selected || false
          this.selected_part = item.selected_part || false
          this.disabled = item.disabled || false
          this.loading = item.loading || false
          this.children = item.children || []
          this._data = util.copy(item)
        }
        return new Model(item, this.textFieldName, this.valueFieldName)
      },
      initializeLoading () {
        var item = {}
        item[this.textFieldName] = this.loadingText
        item.disabled = true
        item.loading = true
        return this.initializeDataItem(item)
      },
      handleRecursionNodeChilds (node, func) {
        if (node.$children && node.$children.length > 0) {
          for (let childNode of node.$children) {
            if (!childNode.disabled) {
              func(childNode)
              this.handleRecursionNodeChilds(childNode, func)
            }
          }
        }
      },
      // 处理父节点选中情况
      handleRecursionNodeParents (node) {
        let parentNode = node.$parent
        let childrengroup = parentNode.$refs.group
        if(!!childrengroup) {
          let len_selected = parentNode.$children.filter(item => item.data.selected).length
          let len = parentNode.$children.filter(item => item.data.selected || item.data.selected_part).length
          let len_children = parentNode.$children.length
          parentNode.data.selected = len_selected == len_children
          parentNode.data.selected_part = len_selected < len_children && len > 0 
          this.handleRecursionNodeParents (parentNode)
        }
      },
      onItemClick (oriNode, oriItem) {
        if (this.multiple) {
            if (this.allowBatch) {
                this.handleBatchSelectItems(oriNode, oriItem)
            }
        } else {
          this.handleSingleSelectItems(oriNode, oriItem)
        }
        this.$emit('item-click', oriNode, oriItem)
      },
      handleSingleSelectItems (oriNode, oriItem) {
        this.handleRecursionNodeChilds(this, node => {
          node.model.selected = false
        })
        oriNode.model.selected = true
      },
      handleBatchSelectItems (oriNode, oriItem) {
        this.handleRecursionNodeChilds(oriNode, node => {
          if (node.model.disabled) return
          oriNode.model.selected_part = false
          node.model.selected = oriNode.model.selected
          node.model.selected_part = false
        })
        this.handleRecursionNodeParents(oriNode)
      },
      onItemToggle (oriNode, oriItem) {
        if (oriNode.model.opened) {
          this.handleAsyncLoad(oriNode.model.children, oriNode, oriItem)
        }
      },
      handleAsyncLoad (oriParent, oriNode, oriItem) {
        var self = this
        if (this.async) {
          if (oriParent[0].loading) {
            this.async(oriNode, (data) => {
              if (data.length > 0) {
                for (let i in data) {
                  data[i].children = [self.initializeLoading()]
                  var dataItem = self.initializeDataItem(data[i])
                  self.$set(oriParent, i, dataItem)
                }
              } else {
                oriNode.model.children = []
              }
            })
          }
        }
      },
      onItemDragStart (e, oriNode, oriItem) {
        if (!this.draggable)
          return false
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData('text', null)
        this.draggedItem = {
          item: oriItem,
          parentItem: oriNode.parentItem,
          index: oriNode.parentItem.indexOf(oriItem)
        }
      },
      onItemDragEnd (e, oriNode, oriItem) {
        if (!this.draggable)
          return false
        this.draggedItem = null
      },
      onItemDrop (e, oriNode, oriItem) {
        if (!this.draggable)
          return false
        if (this.draggedItem) {
          if (this.draggedItem.parentItem === oriItem.children
            || this.draggedItem.item === oriItem
            || (oriItem.children && oriItem.children.indexOf(this.draggedItem.item) !== -1)) {
            return;
          }
          oriItem.children = oriItem.children ?  oriItem.children.concat(this.draggedItem.item) : [this.draggedItem.item]
          var self = this
          this.$nextTick(() => {
            self.draggedItem.parentItem.splice(self.draggedItem.index, 1)
          })
        }
      },
      getSelectedNodes () {
          const nodes = findComponentsDownward(this, 'XTreeItem');
          return nodes.filter(node => node.data.selected||node.data.selected_part).map(node => node.data);
      },
      getAbsSelectedNodes (){
           const nodes = findComponentsDownward(this, 'XTreeItem');
          return nodes.filter(node => node.data.selected).map(node => node.data);
      },
      getUnselectNodes () {
          const nodes = findComponentsDownward(this, 'XTreeItem');
          return nodes.filter(node => !node.data.selected&&!node.data.selected_part).map(node => node.data);
      }
    },
    created () {
      this.initializeData(this.data)
      
    },
    mounted () {
      if (this.async) {
        this.$set(this.data, 0, this.initializeLoading())
        this.handleAsyncLoad(this.data, this)
      }
    },
    components: {
      XTreeItem
    }
  }
</script>
<style lang="less">
    @import "~@/style/xtree/style.less";
</style>