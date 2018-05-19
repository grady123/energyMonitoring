(function() {
    'use strict';
    //该工具现有转场,ajax自动loading,加载器功能，及提示方法下面是示例
    var T = new AllFunc();

    T.Load('./parts/index/energy_two.html', "#energy_two", function() {
        var params = T.AllData.basis_Data;
        var JsonData_tmp = {};
        JsonData_tmp.data = {};
        JsonData_tmp.data.data = [{
            monthNo: '',
            monthDosage: '',
            lastYearMonthDosage: '',
            compare2: '',
            compare1: ''
        }];
        JsonData_tmp.data.info = {};
        JsonData_tmp.data.info.meterCode = '';
        JsonData_tmp.data.info.meterAddress = '';
        JsonData_tmp.data.info.monthDosage = '';
        JsonData_tmp.data.info.lastMonthDegree = '';
        JsonData_tmp.data.info.date = '';
        JsonData_tmp.data.info.sumYear = '';
        JsonData_tmp.data.info.avgYear = '';
        JsonData_tmp.data.info.compare2 = '';
        JsonData_tmp.data.info.compare1 = '';
        //共同传的参数
        function make_chart() {
            T.MyGet('./data/monitor_from_meter.json', function(JsonData) {
                JsonData_tmp.data.data = JsonData.data.data;
                JsonData_tmp.data.info = JsonData.data.info;
                var echart = {};
                echart.month = [];
                echart.num = [];
                echart.lastNum = [];
                for (var i = 0; i < JsonData.data.data.length; i++) {
                    echart.month.push(JsonData.data.data[i].monthNo - 0 + '月');
                    echart.num.push(JsonData.data.data[i].monthDosage);
                    echart.lastNum.push(JsonData.data.data[i].lastYearMonthDosage);
                }
                var nhCharts = echarts.init(document.getElementById('energyChartsTwo'), 'oneWalden');
                var meter = {
                    legend: {
                        data:( params.meterType == 'paytype_1' ? ['本年水量', '上年同期水量'] : ['本年电量', '上年同期电量'])
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    dataZoom: [{
                            type: 'inside',
                            show: true,
                            zoomLock: true,
                            showDetail: false,
                            handleSize: 0,
                            fillerColor: 'rgba(0,0,0,0.2)',
                            height: 10,
                            bottom: 0
                        },
                        {
                            type: 'inside',
                            zoomLock: true
                        }
                    ],
                    xAxis: [{
                        type: 'category',
                        data: echart.month,
                        //data :this.chart.proName,
                        axisLabel: {
                            interval: '0',
                            formatter: function(val) { //字符串换行
                                if (val == null) {
                                    return
                                }
                                var str = '';
                                if (/^\d/.test(val)) {
                                    str = val.replace(/\D/g, function(res) {
                                        var tmp = '';
                                        tmp = '\n' + res;
                                        return tmp;
                                    });
                                } else {
                                    return val.split("").join("\n");
                                }
                                return str;
                            }
                        },
                        splitLine: {
                            show: false
                        }
                    }],
                    grid: { // 控制图的大小，调整下面这些值就可以，
                        x: 50,
                        x2: 50,
                        y: 40,
                        y2: 40 // y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
                    },
                    yAxis: [{
                            type: 'value',
                            //nameLocation:'start',
                            axisLabel: {
                                formatter: function(val, index) {
                                    var text = '';
                                    if (index === 0) {
                                        text = (params.meterType == 'paytype_1' ? '吨' : '度');
                                    } else {
                                        text = val;
                                        //max.max=val
                                    }
                                    return text;
                                }

                            }
                        },
                        //{
                        //	type: 'value',
                        //	show: true,
                        //	splitLine : {
                        //		show: false
                        //	},
                        //	axisLabel: {
                        //		formatter: function(val,index){
                        //			var text='';
                        //			if(index === 0){
                        //				text='%';
                        //			}else{
                        //				text=val;
                        //			}
                        //			return text;
                        //		}
                        //
                        //	},
                        //}
                    ],
                    series: [{
                            name: params.meterType == 'paytype_1' ? '本年水量' : '本年电量',
                            type: 'bar',
                            data: echart.num,
                            //data :this.chart.saturated,
                            hoverAnimation: false,
                            itemStyle: {
                                normal: {
                                    color: '#6DC56E',
                                    barBorderRadius: [3, 3, 0, 0]
                                }
                            }
                        },
                        {
                            name: params.meterType == 'paytype_1' ?  '上年同期水量': '上年同期电量',
                            type: 'bar',
                            data: echart.lastNum,
                            //data :this.chart.income,
                            hoverAnimation: false,
                            itemStyle: {
                                normal: {
                                    color: '#CCEAFF',
                                    barBorderRadius: [3, 3, 0, 0]
                                }
                            }
                        },

                    ],

                };

                nhCharts.setOption(meter);
                nhCharts.resize();
                // 这里面写工作代码
            }, {
                meterId: params.meterId,
                date: params.date
            })
        }
        //	配置参数
        var indexVue = {
            el: '#energyTwo',
            data: {
				JsonData_tmp:JsonData_tmp,
				params:params,
                data:params,


            },
            created: function() {

            },
            methods: make_chart(),
            watch: {
				'data.meterId':{
					handler:function(curVal,oldVal){
						if(curVal==oldVal)return;
						make_chart();
					},
					deep:true
				},
        'data.date':{
					handler:function(curVal,oldVal){
						if(curVal==oldVal)return;
						make_chart();
					},
					deep:true
				}
            }
        };
        indexVue = new Vue(indexVue);
        indexVue.$nextTick(function() {

            $(".go1").on("click", function() {
                T.GoPage(false, '');
            });
        });
    });
})();
