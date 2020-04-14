<template>
	<Modal v-drag-modal v-model="modalShow" :title="title" :mask-closable="false" width="800" @cancel="cancel">
		<div :class="type==2?'select-list-multiple':''" class="select-list" :style="style1">
			<div class="list-tab">
				<Row>
					<Col span="24">
						<RadioGroup v-model="type" type="button" size="small" class="mr-3">
							<Radio :label="0" v-if="allowType0">班级</Radio>
					        <Radio :label="1" v-if="allowType1">1对1</Radio>
					        <Radio :label="2" v-if="allowType2">1对多</Radio>
					    </RadioGroup>						  	
						<div class="pull-right" v-if="type==1||type==2">
	                        <label>权限范围：</label>
	                        <ButtonGroup>
	                            <Button 
		                            :type="student_default_value=='my'?'primary':'ghost'" 
		                            size="small" 
		                            icon="android-person" 
		                            @click="turnStudentLesson('my')">我的
		                        </Button>
	                            <Button 
		                            :type="student_default_value=='all'?'primary':'ghost'" 
		                            size="small" 
		                            icon="android-people" 
		                            :disabled="!perCheckAllStudent" 
		                            @click="turnStudentLesson('all')">所有
		                        </Button>
	                        </ButtonGroup>
	                    </div>
	                    <div class="pull-right" v-if="type==0">
	                        <label>权限范围：</label>
	                        <ButtonGroup>
	                            <Button 
		                            :type="class_default_value=='my'?'primary':'ghost'"  
		                            size="small" 
		                            icon="android-person" 
		                            @click="turnClass('my')">我的
		                        </Button>
	                            <Button 
		                            :type="class_default_value=='all'?'primary':'ghost'"  
		                            size="small" 
		                            icon="android-people" 
		                            :disabled="!perCheckAllClass" 
		                            @click="turnClass('all')">所有
		                        </Button>
	                        </ButtonGroup>
	                    </div>
            		</Col>            		
            	</Row>
            	
		    </div>
	    	<div class="list-condition mt-3">
	    		<Form :label-width="70" class="filter-form row">
	    			<Form-item :label="type===0?'班级名称':'学员姓名'" class="col-sm-6 mb-2">
	    				<Input v-model="data[1].key" placeholder="请输入学员姓名" size="small" v-if="type===1"></Input>
		    			<Input v-model="data[2].key" placeholder="请输入学员姓名" size="small" v-if="type===2"></Input>
		    			<Input v-model="data[0].key" placeholder="请输入班级名称" size="small" v-if="type===0"></Input>
	    			</Form-item>
	    			<Form-item label="课程" class="col-sm-6 mb-2">
	    				<select-lesson v-model="data.lid" clearable class="x-ivu-select"></select-lesson>		
	    			</Form-item>
	    			<template v-if="searchExpand">
		    			<Form-item label="排课状态" class="col-sm-6 mb-2" v-if="enable_arrange_status&&type!=0">
		    				<Select v-model="data.arrange_status">
								<Option :value="-1">不限</Option>
								<Option :value="2">已排满</Option>
								<Option :value="1">未排满</Option>
								<Option :value="0">未排课</Option>
							</Select>		
		    			</Form-item>
		    		</template>
	    		</Form>
	    		<ButtonGroup>
		    		<Button type="primary" @click="search" size="small" icon="ios-search">搜索</Button>
		    		<Button 
		    			type="primary"
		    			size="small"
		    			:icon="searchExpand?'chevron-up':'chevron-down'" 
		    			@click="searchExpand=!searchExpand"
		    			v-if="enable_arrange_status&&type!=0"
		    			>
	    			</Button>
		    	</ButtonGroup>
	    		<Button type="primary" @click="resetSearch" size="small" icon="refresh">重置</Button>
	    		<template v-if="type===0">
				  	<Checkbox 
                		class="ml-1" 
                		v-model="class_type" 
                		:disabled="disabledTemp" 
                		:true-value="1" 
                		:false-value="0">临时班
                	</Checkbox>
                	<span>|</span>
                	<Checkbox
                		class="ml-1" 
                		v-model="is_demo" 
                		:disabled="disabledDemo"
                		:true-value="1" 
                		:false-value="0">体验班
                	</Checkbox>
                </template>
	    	</div>
		    <div class="list-body">
		    	<div class="ivu-table-wrapper" v-loading.like="'student_lessons'" v-if="type!=0">
			    	<table class="table table-list">
			    		<thead>
                            <tr>
                            	<th>#</th>
                                <th width="50" v-if="type===2">
                                	<Checkbox v-model="checkAll" @click.native="handleCheckAll"></Checkbox>
                                </th>
                                <th>姓名</th>
                                <th>课程</th>
                                <th v-if="enable_arrange_status">已排/总课时</th>
                                <th>剩余/总课时</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="(item,index) in filterList(type)" v-if="item.student">
                            	<td><div class="ivu-table-cell">{{index+1}}</div></td>
                                <td v-if="type===2">
                                    <div class="ivu-table-cell">
                                    	<Checkbox :value="item.$selected" @click="toggleSelected(item)" :readonly="true"></Checkbox>
                                    </div>
                                </td>
                                <td>
                                	<div class="ivu-table-cell">
                                		<avatar-and-name 
                                			:src="item.student.photo_url" 
                                			:name="item.student.student_name" 
                                			:sex="item.student.sex"
                                			>
                            			</avatar-and-name>
                                	</div>
                                </td>
                                <td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
                                <td v-if="enable_arrange_status">
                                	<div class="ivu-table-cell">
                                		<span v-if="item.price_type==3">-</span>
	                                	<Progress :percent="studentLessonArrangePercent(item)" :stroke-width="5" v-else>
	                                		{{Number(item.arrange_hours)}}/{{Number(item.total_lesson_hours)}}
	                                	</Progress>
                                	</div>
                                </td>
                                <td>
                                	<div class="ivu-table-cell">
                                		<template v-if="item.price_type==3">
                                			<span>{{item.expire_time_text}}：{{item.expire_time}}</span>
                                		</template>
	                                	<Progress :percent="studentLessonRemainPercent(item)" :stroke-width="5" v-else>
	                                		{{Number(item.remain_lesson_hours)}}/{{Number(item.total_lesson_hours)}}
	                                	</Progress>
                                	</div>
                                </td>
                            </tr>
                            <tr v-if="filterList(type).length == 0">
                                <td :colspan="type==2?6:5" style="text-align: center"><p class="empty">没有找到学员</p></td>
                            </tr>
                        </tbody>                        
			    	</table>
		    	</div>
		    	<div class="ivu-table-wrapper" v-else v-loading.like="'classes'">
		    		<table class="table table-list">
		    			<thead>
                            <tr>
                            	<th>#</th>
                                <th>班级</th>
                                <th>学员数</th>      
                                <th>课程</th>
                                <th>排课次数/总次数</th>
                                <th>考勤次数/总次数</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr :class="{'table-info':item.$selected}" @click="toggleSelected(item)" v-for="(item,index) in filterList(type)">
                            	<td><div class="ivu-table-cell">{{index+1}}</div></td>
                                <td><div class="ivu-table-cell">{{item.class_name}}</div></td>
                                <td><div class="ivu-table-cell">{{item.student_nums}}</div></td>
                                <td><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
                                <td>
                                	<div class="ivu-table-cell">
	                                	<Progress :percent="classArrangePercent(item)" :stroke-width="5">
	                                		{{item.arrange_times}}/{{item.lesson_times}}
	                                	</Progress>
                                	</div>
                                </td>
                                <td>
                                	<div class="ivu-table-cell">
	                                	<Progress :percent="classAttendancePercent(item)" :stroke-width="5">
	                                		{{item.attendance_times}}/{{item.lesson_times}}
	                                	</Progress>
                                	</div>
                                </td>
                            </tr>
                            <tr v-if="filterList(type).length == 0">
                                <td colspan="6" style="text-align: center"><p class="empty">没有找到班级</p></td>
                            </tr>
                        </tbody>
		    		</table>
		    	</div>
		    	<div class="mt-3 text-right">
                    <Page :total="total" 
                    :current="pageIndex" 
                    :show-sizer="true" 
                    :page-size="pageSize" 
                    :show-total="true" 
                    @on-change="pagenation" 
                    @on-page-size-change="pagesize"
                    >
                    </Page>
                </div>
		    </div>
	    	<div class="multi-selected" v-if="type===2" :style="style2">
                <Card>
                    <div slot="title">
                        <span>已选择：<span class="badge">{{selectedTotal}}</span></span>
                        <Button @click="clearSelectedId" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="清空"></Button>
                    </div>
                    <ul class="multi-selected-list">
                        <li v-for="item in selected.ids">
                            <span>{{selected.map_ids[item].student.student_name}}</span>
                            <Button @click="cancelSelectedId(item)" class="pull-right" type="ghost" shape="circle" size="small" icon="trash-a" title="移除"></Button>
                        </li>
                    </ul>
                </Card>
            </div>
		</div>
		<div slot="footer">
			<div class="pull-left" v-if="type!==2&&selected.ids.length>0">
				已选择：<span class="text-info">
					<label v-if="type===0">{{selected.map_ids[selected.ids[0]].class_name}}</label>
					<label v-else>{{selected.map_ids[selected.ids[0]].student.student_name}}</label>
				</span>
			</div>
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
 		</div>
	</Modal>
</template>