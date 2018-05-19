(function(){
	'use strict';
	//该工具现有转场,ajax自动loading,加载器功能，及提示方法下面是示例
	var ID={userId:6502};
	var T = new AllFunc();
	var pageId="#energy_one";
	var url='./parts/index/energy_one.html';
	//共同传的参数
	//var params = {userId:ID.userId,unitId:1171,name:'开发环境',orgUnitLevel:3,undertakeType:'all',meterType:'paytype_1',date:'',meterId:''};
	//T.AllData.basis_Data =params;
	//自动登录 ---------------------
	T.AutoLogin(ID,'',function(){T.Load(url,pageId,basisfun);});

	function basisfun(){
		var LoginInfo=T.LoginInfo;
		console.log(LoginInfo);
		var nowYear = new Date().getFullYear();
		var moon = new Date().getMonth()+1;
         //暴露出去参数(开发环境参数)
		var params = {userId:ID.userId,unitId:1171,name:'开发环境',orgUnitLevel:3,undertakeType:'all',meterType:'paytype_1',date:'',meterId:''};

		T.AllData.basis_Data =params;
		var URL=['./data/monitor_by_org.json',
			'./data/query_pandect.json',
			'./data/monitor_by_meter.json'
		];
		var parameter=[{'unitId':params.unitId,'undertakeType':params.undertakeType,'date':'','meterType':params.meterType},
			{'unitId':params.unitId,'year':'','undertakeType':params.undertakeType,'paytype':params.meterType},
			{'unitId':params.unitId,'date':'','undertakeType':params.undertakeType,'meterType':params.meterType}
		];
		parameter[0].date=nowYear + '-' + moon;
		parameter[2].date=nowYear + '-' + moon;

		if(moon<10){
			params.date=nowYear + '-0' + moon+'-01';
		}else{
			params.date=nowYear + '-' + moon+'-01';
		}
		parameter[1].year=nowYear;
		var ms ={
			//初始组织数据
			tissue:function () {
				T.MyGet('./data/org_tree_data_query_auth.json',function(res){
					if(res.status==0){
						$.each(parameter,function(index,val){
							val.unitId=res.data[0].id;});
						params.unitId=res.data[0].id;
						params.name=res.data[0].orgUnitName;
						params.orgUnitLevel=res.data[0].orgUnitLevel;
					}else{T.Tip(res.message);}
				}.bind(this),ID);
			},
			//获取组织数据
			selChange:function(){
				T.AllData.selectUnitstatus = false;
				var that=this;
				var callBack = function(data){
					$.each(parameter,function(index,val){
						val.unitId=data.id;});
					params.orgUnitLevel=data.orgUnitLevel;
					params.unitId=data.id;
					that.orgLevel=params.orgUnitLevel;
					if(params.orgUnitLevel===4){
						if(that.buttonNavigation!==1){
							that.buttonNavigation=2;
						}
					}else{
						if(that.buttonNavigation!==1){
							that.buttonNavigation=0;
						}else{
							that.buttonNavigation=1;
						}
					}
					params.name=data.name;
				};
				T.AllData.selectUnit(ID.userId,params.name,callBack)
			},
			//物业选择
			column:function(i){
				params.undertakeType=i;
				$.each(parameter,function(index,val){
					val.undertakeType=i;});
				this.undertakeType=i;
			},
			//同比环比选择
			submenu:function(i){
				this.title=i;
				this.yj_done2();
				if(this.buttonNavigation===1){
					this.echarts();
				}
				if(this.title===0){
					if(this.sumMonth>this.sumLastYearMonth){this.iconfont=1}else if(this.sumMonth<this.sumLastYearMonth){this.iconfont=2}else{this.iconfont=0}
				}else if(this.title===1){
					if(this.sumMonth>this.sumLastMonth){this.iconfont=1}else if(this.sumMonth<this.sumLastMonth){this.iconfont=2}else{this.iconfont=0}
				}else if(this.title===2){
					if(this.sumMonth>this.avgYear){this.iconfont=1}else if(this.sumMonth<this.avgYear){this.iconfont=2}else{this.iconfont=0}
				}
			},
			echarts:function(){
				var nhCharts = echarts.init(document.getElementById('unitNhChartsTwo'),'oneWalden');
				//同比
				var an = {
					legend: {
						data:['本年用量','上年同期用量','同比']
					},
					tooltip : {
						trigger: 'axis',
						axisPointer : {            // 坐标轴指示器，坐标轴触发有效
							type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
						}
					},
					dataZoom:[{
						type:'inside',
						show:true,
						startValue:0,
						endValue:15,
						zoomLock:true,
						showDetail:false,
						handleSize:0,
						fillerColor:'rgba(0,0,0,0.2)',
						height:10,
						bottom:0
					},
						{
							type:'inside',
							zoomLock:true
						}],
					xAxis : [
						{
							type : 'category',
							//data :['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
							data :this.chart.month,
							axisLabel:{
								interval:'0',
								formatter:function(val){//字符串换行
									if(val==null){return}
									var str='';
									if(/^\d/.test(val)){
										str=val.replace(/\D/g,function(res){
											var tmp='';
											tmp='\n'+res;
											return tmp;
										});
									}else{
										return val.split("").join("\n");
									}
									return str;
								}
							},
							splitLine:{
								show:false
							}
						}
					],
					grid: { // 控制图的大小，调整下面这些值就可以，
						x: 50,
						x2: 50,
						y: 40,
						y2: 40// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
					},
					yAxis : [
						{
							type : 'value',
							//nameLocation:'start',
							axisLabel: {
								formatter: function(val,index){
									var text='';
									if(index === 0){
										if(parameter[0].meterType==='paytype_1'){
											if(params.orgUnitLevel<4){text='千吨';}else{text='吨';}
										}else{
											if(params.orgUnitLevel<4){text='万度';}else{text='度';}
										}
									}else{
										text=val;
										//max.max=val
									}
									return text;
								}

							}
						},
						{
							type: 'value',
							show: true,
							splitLine : {
								show: false
							},
							axisLabel: {
								formatter: function(val,index){
									var text='';
									if(index === 0){
										text='%';
									}else{
										text=val;
									}
									return text;
								}

							},
						}
					],
					series : [
						{
							name:'本年用量',
							type:'bar',
							//data:[987,789,885,752,625,755,545,785,546,562,455,428],
							data:this.chart.thisYear,
							//data :this.chart.saturated,
							hoverAnimation:false,
							itemStyle:{
								normal:{
									color:'#6DC56E',
									barBorderRadius:[3,3,0,0]
								}
							}
						},
						{
							name:'上年同期用量',
							type:'bar',
							//data:[546,645,456,654,522,454,522,546,665,542,672,250],
							data:this.chart.lastYear,
							hoverAnimation:false,
							itemStyle:{
								normal:{
									color:'#CCEAFF',
									barBorderRadius:[3,3,0,0]
								}
							}
						},
						{
							name:'同比',
							type:'line',
							yAxisIndex: 1,
							hoverAnimation:false,
							"symbolSize": "6",
							"lineStyle": {
								"normal": {
									"width": "2",
									color:'#FF723A'
								}
							},
							itemStyle : {
								normal : {
									color:'#FF723A'
								}
							},
							symbol: 'circle',
							//data:[12,545,5,64,545,65,258,2,252,454,645,52]
							data:this.chart.anRate
						}
					],

				};
				//环比
				var mom = {
					legend: {
						data:['本年用量','上期用量','环比']
					},
					tooltip : {
						trigger: 'axis',
						axisPointer : {            // 坐标轴指示器，坐标轴触发有效
							type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
						}
					},
					dataZoom:[{
						type:'inside',
						show:true,
						startValue:0,
						endValue:15,
						zoomLock:true,
						showDetail:false,
						handleSize:0,
						fillerColor:'rgba(0,0,0,0.2)',
						height:10,
						bottom:0
					},
						{
							type:'inside',
							zoomLock:true
						}],
					xAxis : [
						{
							type : 'category',
							//data :['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
							data :this.chart.month,
							axisLabel:{
								interval:'0',
								formatter:function(val){//字符串换行
									if(val==null){return}
									var str='';
									if(/^\d/.test(val)){
										str=val.replace(/\D/g,function(res){
											var tmp='';
											tmp='\n'+res;
											return tmp;
										});
									}else{
										return val.split("").join("\n");
									}
									return str;
								}
							},
							splitLine:{
								show:false
							}
						}
					],
					grid: { // 控制图的大小，调整下面这些值就可以，
						x: 50,
						x2: 50,
						y: 40,
						y2: 40// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
					},
					yAxis : [
						{
							type : 'value',
							//nameLocation:'start',
							axisLabel: {
								formatter: function(val,index){
									var text='';
									if(index === 0){
										if(parameter[0].meterType==='paytype_1'){
											if(params.orgUnitLevel<4){text='千吨';}else{text='吨';}
										}else{
											if(params.orgUnitLevel<4){text='万度';}else{text='度';}
										}
									}else{
										text=val;
										//max.max=val
									}
									return text;
								}

							}
						},
						{
							type: 'value',
							show: true,
							splitLine : {
								show: false
							},
							axisLabel: {
								formatter: function(val,index){
									var text='';
									if(index === 0){
										text='%';
									}else{
										text=val;
									}
									return text;
								}

							},
						}
					],
					series : [
						{
							name:'本年用量',
							type:'bar',
							//data:[987,789,885,752,625,755,545,785,546,562,455,428],
							data:this.chart.thisYear,
							//data :this.chart.saturated,
							hoverAnimation:false,
							itemStyle:{
								normal:{
									color:'#6DC56E',
									barBorderRadius:[3,3,0,0]
								}
							}
						},
						{
							name:'上期用量',
							type:'bar',
							//data:[546,645,456,654,522,454,522,546,665,542,672,250],
							data:this.chart.lastMonth,
							hoverAnimation:false,
							itemStyle:{
								normal:{
									color:'#CCEAFF',
									barBorderRadius:[3,3,0,0]
								}
							}
						},
						{
							name:'环比',
							type:'line',
							yAxisIndex: 1,
							hoverAnimation:false,
							"symbolSize": "6",
							"lineStyle": {
								"normal": {
									"width": "2",
									color:'#FF723A'
								}
							},
							itemStyle : {
								normal : {
									color:'#FF723A'
								}
							},
							symbol: 'circle',
							//data:[12,545,5,64,545,65,258,2,252,454,645,52]
							data:this.chart.momRate
						}
					],

				};
				//平均值
				var mean ={
					legend: {
						data:['本年用量','年平均用量','平均值']
					},
					tooltip : {
						trigger: 'axis',
						axisPointer : {            // 坐标轴指示器，坐标轴触发有效
							type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
						}
					},
					dataZoom:[{
						type:'inside',
						show:true,
						startValue:0,
						endValue:15,
						zoomLock:true,
						showDetail:false,
						handleSize:0,
						fillerColor:'rgba(0,0,0,0.2)',
						height:10,
						bottom:0
					},
						{
							type:'inside',
							zoomLock:true
						}],
					xAxis : [
						{
							type : 'category',
							//data :['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
							data :this.chart.month,
							axisLabel:{
								interval:'0',
								formatter:function(val){//字符串换行
									if(val==null){return}
									var str='';
									if(/^\d/.test(val)){
										str=val.replace(/\D/g,function(res){
											var tmp='';
											tmp='\n'+res;
											return tmp;
										});
									}else{
										return val.split("").join("\n");
									}
									return str;
								}
							},
							splitLine:{
								show:false
							}
						}
					],
					grid: { // 控制图的大小，调整下面这些值就可以，
						x: 50,
						x2: 50,
						y: 40,
						y2: 40// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
					},
					yAxis : [
						{
							type : 'value',
							//nameLocation:'start',
							axisLabel: {
								formatter: function(val,index){
									var text='';
									if(index === 0){
										if(parameter[0].meterType==='paytype_1'){
											if(params.orgUnitLevel<4){text='千吨';}else{text='吨';}
										}else{
											if(params.orgUnitLevel<4){text='万度';}else{text='度';}
										}
									}else{
										text=val;
										//max.max=val
									}
									return text;
								}

							}
						},
						{
							type: 'value',
							show: true,
							splitLine : {
								show: false
							},
							axisLabel: {
								formatter: function(val,index){
									var text='';
									if(index === 0){
										text='%';
									}else{
										text=val;
									}
									return text;
								}

							},
						}
					],
					series : [
						{
							name:'本年用量',
							type:'bar',
							//data:[987,789,885,752,625,755,545,785,546,562,455,428],
							data:this.chart.thisYear,
							//data :this.chart.saturated,
							hoverAnimation:false,
							itemStyle:{
								normal:{
									color:'#6DC56E',
									barBorderRadius:[3,3,0,0]
								}
							}
						},
						{
							name:'年平均用量',
							type:'bar',
							//data:[546,645,456,654,522,454,522,546],
							data:this.chart.avgYear,
							hoverAnimation:false,
							itemStyle:{
								normal:{
									color:'#CCEAFF',
									barBorderRadius:[3,3,0,0]
								}
							}
						},
						{
							name:'平均值',
							type:'line',
							yAxisIndex: 1,
							hoverAnimation:false,
							"symbolSize": "6",
							"lineStyle": {
								"normal": {
									"width": "2",
									color:'#FF723A'
								}
							},
							itemStyle : {
								normal : {
									color:'#FF723A'
								}
							},
							symbol: 'circle',
							//data:[12,545,5,64,545,65,258,2,252,454,645,52]
							data:this.chart.avgRate
						}
					],

				};
				if(this.title===0){
					nhCharts.setOption(an);
				}else if(this.title===1){
					nhCharts.setOption(mom);
				}else if(this.title===2){
					nhCharts.setOption(mean);
				}
				nhCharts.resize();
			},
			//底部按钮点击展开和收缩列表事件
			accordion:function(){
				if(this.bottomBtnData.bSign){
					this.bottomBtnData.text='收起列表';
					this.bottomBtnData.bSign=false;
					this.bottomBtnData.len=this.listdata.length;
				}else{
					this.bottomBtnData.text='展开列表';
					this.bottomBtnData.bSign=true;
					this.bottomBtnData.len=8;
				}
			},
			//仪表页
			meter: function (unitId,i,unitName) {

				if(i===this.orgLevel){
					$.each(parameter,function(index,val){
						val.unitId=unitId;});
					params.unitId=unitId;
					this.buttonNavigation=2;
					params.name=unitName;
				}else if(this.orgLevel===4){
					params.meterId=unitId;
					T.GoPage(1,'right');
				}else{
					$.each(parameter,function(index,val){
						val.unitId=unitId;});
					params.unitId=unitId;
					params.name=unitName;
				}

			},
			//倍率
			power: function () {

			},
			//底部导航切换
			botNavigation:function(index){
				if(index===this.buttonNavigation){return;}
				this.buttonNavigation=index;
				if(this.orgLevel===4&&this.buttonNavigation!==1){
					this.buttonNavigation=2;
				}
				this.getData();

			},
			yj_active:function(index){
				return {
					"active": ( this.yj_index == index )
				}
			},
			yj_change:function(num,index){
				this.yj_result = num;
				this.yj_index = index;
			},
			yj_click:function(){
				this.yj_selMode = !this.yj_selMode;
				this.yj_result_cache.num='';
			},
			yj_done:function(fun){
				if(this.changeCount(this.yj_result)){return;}
				this.yj_selMode = !this.yj_selMode;
				if(this.yj_result===''){return;}
					this.yj_done2();
			},
			//倍率判断
			changeCount:function(multiplying){

				var digits=1;
				var multiplyingStr = multiplying+"";

				if(multiplying=="" ||multiplying==undefined){
					T.Tip("倍率不合法");
					return true;
				}

				if(multiplyingStr.indexOf("..") > 0 ){
					T.Tip("倍率不合法");
					return true;
				};

				var fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,2})?$/;
				if(digits=="1"){
					fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,1})?$/;
				}else if(digits=="2"){
					fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,2})?$/;
				}else if(digits=="3"){
					fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,3})?$/;
				}else if(digits=="4"){
					fix_amountTest=/^(([1-9]\d*)|\d)(\.\d{1,4})?$/;
				}
				if(fix_amountTest.test(multiplying)==false){
					T.Tip("倍率不合法");
					return true;
				}
				multiplying=multiplying-0
				if(multiplying>5||multiplying===0){
					T.Tip("最大值为5和不能为0!");
					return true;
				}
			},
			yj_done2: function (v) {
				if(this.buttonNavigation===0||this.buttonNavigation===2){
					var that=this;
					//that.listdata=that.listdata.concat(that.listdata2);
					if(!v){
						if(that.listdata2.length!==0){
							for(var i=0;i<that.listdata2.length;i++){
								that.listdata.unshift(that.listdata2[i]);
							}
						}
					}
					that.listdata2=[];
					that.multiplying=(this.yj_result-0);
					window.localStorage.setItem("power",that.multiplying);
					$.each(this.listdata,function(index,val){
						//an 同比  mom环比  mean年平均
						val.an=	T.accMul(val.sumLastYearMonth||0,that.multiplying);
						val.mom=T.accMul(val.sumLastMonth||0,that.multiplying);
						val.mean=T.accMul(val.avgYear||0,that.multiplying);
						val.an2=T.accDiv(val.sumLastYearMonth||0,that.multiplying);
						val.mom2=T.accDiv(val.sumLastMonth||0,that.multiplying);
						val.mean2=T.accDiv(val.avgYear||0,that.multiplying);
					});
					if(this.title===0){
						for(var i=0;i<that.listdata.length;i++){
							if(that.listdata[i].an!==0&&that.listdata[i].sumMonth!==0){
								if(that.listdata[i].an<=that.listdata[i].sumMonth){
									that.listdata2.push(that.listdata[i]);
									that.listdata.splice(i,1);
									i--;
								}else if(isFinite(that.listdata[i].an2)&&that.listdata[i].an2!==0){
									if(that.listdata[i].an2>=that.listdata[i].sumMonth){
										that.listdata2.push(that.listdata[i]);
										that.listdata.splice(i,1);
										i--;
									}
								}
							}
						}
					}else if(this.title===1){
						for(var i=0;i<that.listdata.length;i++){
							if(that.listdata[i].mom!==0&&that.listdata[i].sumMonth!==0){
								if(that.listdata[i].mom<=that.listdata[i].sumMonth){
									that.listdata2.push(that.listdata[i]);
									that.listdata.splice(i,1);
									i--;
								}else if(isFinite(that.listdata[i].mom2)&&that.listdata[i].mom2!==0){
									if(that.listdata[i].mom2>=that.listdata[i].sumMonth){
										that.listdata2.push(that.listdata[i]);
										that.listdata.splice(i,1);
										i--;
									}
								}
							}
						}
					}else if(this.title===2){
						for(var i=0;i<that.listdata.length;i++){

							if(that.listdata[i].mean!==0&&that.listdata[i].sumMonth!==0){
								if(that.listdata[i].mean<=that.listdata[i].sumMonth){
									that.listdata2.push(that.listdata[i]);
									that.listdata.splice(i,1);
									i--;
								}else if(isFinite(that.listdata[i].mean2)&&that.listdata[i].mean2!==0){
									if(that.listdata[i].mean2>=that.listdata[i].sumMonth){
										that.listdata2.push(that.listdata[i]);
										that.listdata.splice(i,1);
										i--;
									}
								}
							}
						}
					}
				}
			},
			getData:function(){
                //重置
                // this.name='';
                this.date2='';
                this.sumMonth='';
                this.date='';
                this.sumYear='';
                this.sumLastYearMonth='';
                this.sumLastMonth='';
                this.avgYear='';
                this.compare2='';
                this.compare1='';
                this.compare3='';
                this.listdata2=[];
                this.listdata=[];
                if(this.buttonNavigation==2){this.toggle='仪表'}else {this.toggle='组织'};
				T.MyGet(URL[this.buttonNavigation],function(res){
					if(res.status==0){
					if(this.buttonNavigation===0||this.buttonNavigation===2){
						//组织页面
						var info=res.data.info;
						var data=res.data.data;
						this.orgLevel=info.orgLevel;
						this.listdata=data;
						var that=this;
						$.each(this.listdata,function(index,val){
							val.compare1=val.compare1||0;
							val.compare2=val.compare2||0;
							val.compare3=val.compare3||0;

							val.sumMonth=val.sumMonth||0
						});
					}else if(this.buttonNavigation===1){
						//	时间页面
						var that=this;
						that.chart.month=[];
						that.chart.thisYear=[];
						that.chart.lastYear=[];
						that.chart.lastMonth=[];
						that.chart.avgYear=[];
						that.chart.anRate=[];
						that.chart.momRate=[];
						that.chart.avgRate=[];
						var info=res.data.energyMonitorInfo;
						var data=res.data.detailList;
						this.listdata=data;
						if(parameter[0].meterType==='paytype_1'){
							//水类型
							if(params.orgUnitLevel<4){
								$.each(this.listdata,function(index,val){
									that.chart.month.push(val.month);
									that.chart.thisYear.push((val.thisYear).toFixed(2));
									that.chart.lastYear.push((val.lastYear).toFixed(2));
									that.chart.lastMonth.push((val.lastMonth).toFixed(2));
									that.chart.avgYear.push((val.avgYear).toFixed(2));
								});
							}else{
								$.each(this.listdata,function(index,val){
									that.chart.month.push(val.month);
									that.chart.thisYear.push((val.thisYear*1000).toFixed(2));
									that.chart.lastYear.push((val.lastYear*1000).toFixed(2));
									that.chart.lastMonth.push((val.lastMonth*1000).toFixed(2));
									that.chart.avgYear.push((val.avgYear*1000).toFixed(2));
								});
							}
						}else{
							//电类型
							if(params.orgUnitLevel<4){
								$.each(this.listdata,function(index,val){
									that.chart.month.push(val.month);
									that.chart.thisYear.push((val.thisYear).toFixed(2));
									that.chart.lastYear.push((val.lastYear).toFixed(2));
									that.chart.lastMonth.push((val.lastMonth).toFixed(2));
									that.chart.avgYear.push((val.avgYear).toFixed(2));

								});
							}else{
								$.each(this.listdata,function(index,val){
									that.chart.month.push(val.month);
									that.chart.thisYear.push((val.thisYear*10000).toFixed(2));
									that.chart.lastYear.push((val.lastYear*10000).toFixed(2));
									that.chart.lastMonth.push((val.lastMonth*10000).toFixed(2));
									that.chart.avgYear.push((val.avgYear*10000).toFixed(2));
								});
							}
						}
						$.each(this.listdata,function(index,val){
							that.chart.anRate.push((val.anRate).toFixed(1));
							that.chart.momRate.push((val.momRate).toFixed(1));
							that.chart.avgRate.push((val.avgRate).toFixed(1));
						});
						$.each(this.listdata,function(index,val){
							val.anRate=val.anRate||0;
							val.momRate=val.momRate||0;
							val.avgRate=val.avgRate||0;
						});
						this.echarts()
						}
						this.date=info.date;
						this.compare1=info.compare1||0;
						this.compare2=info.compare2||0;
						this.compare3=info.compare3||0;
						//console.log(info);
						this.name=info.fullUnitName;
						this.sumMonth=info.sumMonth;
						this.sumYear=info.sumYear;
						this.sumLastYearMonth=info.sumLastYearMonth;
						this.sumLastMonth=info.sumLastMonth;
						this.avgYear=info.avgYear;
						if(this.title===0){
							if(this.sumMonth>this.sumLastYearMonth){this.iconfont=1}else if(this.sumMonth<this.sumLastYearMonth){this.iconfont=2}else{this.iconfont=0}
						}else if(this.title===1){
							if(this.sumMonth>this.sumLastMonth){this.iconfont=1}else if(this.sumMonth<this.sumLastMonth){this.iconfont=2}else{this.iconfont=0}
						}else if(this.title===2){
							if(this.sumMonth>this.avgYear){this.iconfont=1}else if(this.sumMonth<this.avgYear){this.iconfont=2}else{this.iconfont=0}
						}
						indexVue.$nextTick(function(){this.yj_done2(true);});
					}else{T.Tip(res.message);}
				}.bind(this),parameter[this.buttonNavigation]);
			}
		};
		//	配置参数
		var indexVue ={
			el:'#energyOne',
			data:{
                toggle:'组织',
				name:'',
				orgLevel:'',
				multiplying:window.localStorage.getItem("power")||1.5,
				compare1:'',
				compare2:'',
				compare3:'',
				sumMonth:'',
				sumYear:'',
				sumLastYearMonth:'',
				iconfont:false,
				sumLastMonth:'',
				avgYear:'',
				date:'',
				date2:nowYear + '-' + moon,
				params:params,
				undertakeType :'all',
				title:0,
				buttonNavigation:0,
				listdata:[],
				listdata2:[],
				bottomBtnData:{
					"text":"展开全部",
					"bSign":true,
					"len":8
				},
			//	图表数据
				chart:{
					month:[],
					thisYear:[],
					lastYear:[],
					lastMonth:[],
					avgYear:[],
					anRate:[],
					momRate:[],
					avgRate:[]
				},
				yj_result_cache : {num:''},
				yj_result :window.localStorage.getItem("power")||1.5,
				yj_index : 1,
				yj_selMode : false
			},
			created:function(){
				this.tissue();
			},
			methods:ms,
			watch:{
				yj_result_cache:{
					handler: function() {
						this.yj_change(this.yj_result_cache.num,5)
					},
					deep: true
				},
				'params.name':{
					handler:function(curVal,oldVal){
						if(curVal==oldVal)return;
						this.getData();
					},
					deep:true
				},
				'params.meterType':{
					handler:function(curVal,oldVal){
						if(curVal==oldVal)return;
						this.getData();
					},
					deep:true
				},
				'undertakeType':{
					handler:function(curVal,oldVal){
						if(curVal==oldVal)return;
						this.getData();
					},
					deep:true
				},

			}
		};
		indexVue = new Vue(indexVue);
		indexVue.$nextTick(function(){
			var swiper = new Swiper('#energySwper', {
				pagination: '#energyPagination',
				paginationClickable: true,
				spaceBetween: 15,
				autoHeight: true,
				slidesPerView: 'auto',
				//loop: true,
				onTransitionEnd: function(swiper){
					if(swiper.realIndex===1){
						parameter[0].meterType='paytype_2';
						parameter[2].meterType='paytype_2';
						parameter[1].paytype='paytype_2';
						params.meterType='paytype_2';
					}else if(swiper.realIndex===0){
						params.meterType='paytype_1';
						parameter[0].meterType='paytype_1';
						parameter[2].meterType='paytype_1';
						parameter[1].paytype='paytype_1';
					}
				}
			});

			var gYear = [];
			for (var i = 0; i < 20; i++) {
				gYear.push(Number(nowYear) - i);
			}
			var month = [1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12];
			//年、时间页
			$(".qu-year").html(nowYear);
			$.scrEvent({
				data: gYear,
				evEle: '.qu-year',
				title: '年份',
				defValue: nowYear,
				afterAction: function (data) {
					parameter[1].year=data;
					$(".qu-year").html(data);
					indexVue.getData();
				}
			});
			//年月，组织页
			$('.qu-weight').html(nowYear + '-' + moon);
			$.scrEvent2({
				data: gYear,
				data2: month,
				evEle: '.qu-weight',
				title: '年月',
				linkType: '-',
				defValue: nowYear,
				defValue2: moon,
				afterAction: function (data1, data2) {
					parameter[0].date=data1 + '-' + data2;
					parameter[2].date=data1 + '-' + data2;
					moon=data2;
					console.log();
					if(moon<10){
						params.date=data1 + '-0' + data2+'-01';
					}else{
						params.date=data1 + '-' + data2+'-01';
					}
					$('.qu-weight').html(data1 + '-' + data2);
					indexVue.getData();
				}
			});
			//过滤器
			(function () {
				Vue.filter('compare',function(v){
					v=(Math.abs(v*100)).toFixed(1);
					return v;
				});
				Vue.filter('compare2',function(v){
					v=(Math.abs(v)).toFixed(1);
					return v;
				});
				Vue.filter('type',function(v){
					if(indexVue.orgLevel>=4){
						return (v-0);
					}else if(parameter[0].meterType==='paytype_1'){
						v=(v/1000).toFixed(2);
						return v;
					}else{
						v=(v/10000).toFixed(2);
						return v;
					}
				});
				Vue.filter('type2',function(v){
					if(indexVue.buttonNavigation===1&&indexVue.orgLevel>=4){
						if(parameter[0].meterType==='paytype_1'){
							v=(v*1000).toFixed(0);
							return v;
						}else{
							v=(v*10000).toFixed(0);
							return v;
						}
					}else{
						return (v-0).toFixed(2);
					}
				});
				Vue.filter('null',function(v){
					if(v==null||v==''||v==0||v=='0'){
						return '0.0';
					}else{
						return v;
					}
				});
                Vue.filter('ICR',function(v){
                	if (typeof(v)=="undefined"){return}
                	if(v.indexOf('-')==-1){
                		return v;
                }else {
                        var a=v.split('-');
                        return	a[0]+'...'+a[a.length-1];
					}
                });
			})();

		});
		// 这里面写工作代码
		}
	//如果是第一个模块
	//T.GoPage(0);
	})();
