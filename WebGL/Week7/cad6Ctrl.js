"use strict";

var mySliderSx, mySliderSy, mySliderSz, mySliderRx, mySliderRy, mySliderRz, mySliderPx, mySliderPy, mySliderPz, mySliderL1Px, mySliderL1Py, mySliderL1Pz, mySliderL1Dist, mySliderL2Px, mySliderL2Py, mySliderL2Pz, mySliderL2Dist;

function doOnLoad(){

    mySliderSx = new dhtmlXSlider({
        parent: "sliderObjSx",
        step: 0.1,
        min: 0.1,
        max: 2,
        value: 1,
        linkTo: "inpSx",
    });
    mySliderSy = new dhtmlXSlider({
        parent: "sliderObjSy",
        step: 0.1,
        min: 0.1,
        max: 2,
        value: 1,
        linkTo: "inpSy",
    });
    mySliderSz = new dhtmlXSlider({
        parent: "sliderObjSz",
        step: 0.1,
        min: 0.1,
        max: 2,
        value: 1,
        linkTo: "inpSz",
    });
    
    mySliderRx = new dhtmlXSlider({
        parent: "sliderObjRx",
        step: 1,
        min: -180,
        max: 180,
        value: 0,
        linkTo: "inpRx",
    });
    mySliderRy = new dhtmlXSlider({
        parent: "sliderObjRy",
        step: 1,
        min: -180,
        max: 180,
        value: 0,
        linkTo: "inpRy",
    });
    mySliderRz = new dhtmlXSlider({
        parent: "sliderObjRz",
        step: 1,
        min: -180,
        max: 180,
        value: 0,
        linkTo: "inpRz",
    });
    
    mySliderPx = new dhtmlXSlider({
        parent: "sliderObjPx",
        step: 0.1,
        min: -1,
        max: 1,
        value: 0,
        linkTo: "inpPx",
    });
    mySliderPy = new dhtmlXSlider({
        parent: "sliderObjPy",
        step: 0.1,
        min: -1,
        max: 1,
        value: 0,
        linkTo: "inpPy",
    });
    mySliderPz = new dhtmlXSlider({
        parent: "sliderObjPz",
        step: 0.1,
        min: -2,
        max: 2,
        value: 0,
        linkTo: "inpPz",
    });
    
    mySliderL1Px = new dhtmlXSlider({
        parent: "sliderObjL1Px",
        step: 1,
        min: 0,
        max: 20,
        value: 10,
        linkTo: "inpL1Px",
    });
    mySliderL1Py = new dhtmlXSlider({
        parent: "sliderObjL1Py",
        step: 1,
        min: 0,
        max: 20,
        value: 10,
        linkTo: "inpL1Py",
    });
    mySliderL1Pz = new dhtmlXSlider({
        parent: "sliderObjL1Pz",
        step: 1,
        min: 0,
        max: 20,
        value: 10,
        linkTo: "inpL1Pz",
    });
    mySliderL1Dist = new dhtmlXSlider({
        parent: "sliderObjL1Dist",
        step: 1,
        min: 0,
        max: 34,
        value: 15,
        linkTo: "inpL1Dist",
    });
    mySliderL2Px = new dhtmlXSlider({
        parent: "sliderObjL2Px",
        step: 1,
        min: 0,
        max: 20,
        value: 10,
        linkTo: "inpL2Px",
    });
    mySliderL2Py = new dhtmlXSlider({
        parent: "sliderObjL2Py",
        step: 1,
        min: 0,
        max: 20,
        value: 10,
        linkTo: "inpL2Py",
    });
    mySliderL2Pz = new dhtmlXSlider({
        parent: "sliderObjL2Pz",
        step: 1,
        min: 0,
        max: 20,
        value: 10,
        linkTo: "inpL2Pz",
    });
    mySliderL2Dist = new dhtmlXSlider({
        parent: "sliderObjL2Dist",
        step: 1,
        min: 0,
        max: 34,
        value: 15,
        linkTo: "inpL2Dist",
    });
    
    mySliderSx.attachEvent("onChange", function(pos, slider){
        window.inpSx = mySliderSx.getValue();
    });
    mySliderSy.attachEvent("onChange", function(pos, slider){
        window.inpSy = mySliderSy.getValue();
    });
    mySliderSz.attachEvent("onChange", function(pos, slider){
        window.inpSz = mySliderSz.getValue();
    });
    
    mySliderRx.attachEvent("onChange", function(pos, slider){
        window.inpRx = mySliderRx.getValue();
    });
    mySliderRy.attachEvent("onChange", function(pos, slider){
        window.inpRy = mySliderRy.getValue();
    });
    mySliderRz.attachEvent("onChange", function(pos, slider){
        window.inpRz = mySliderRz.getValue();
    });
    
    mySliderPx.attachEvent("onChange", function(pos, slider){
        window.inpPx = mySliderPx.getValue();
    });
    mySliderPy.attachEvent("onChange", function(pos, slider){
        window.inpPy = mySliderPy.getValue();
    });
    mySliderPz.attachEvent("onChange", function(pos, slider){
        window.inpPz = mySliderPz.getValue();
    });
    
    
};



$(".field").on('input', function(){
    setCadValues();
});

$(".option").change(function(){
    window.inpShape = $(this).children("option:selected").index();
    
});

jQuery('.tabs .tab-links a').on('click', function(e){
    var currentAttrValue = jQuery(this).attr('href');
    
    // Show/Hide Tabs
    jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
    
    // Change/remove current tab to active
    jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
    
    e.preventDefault();
});



function resetScale(){
    mySliderSx.setValue(1);
    mySliderSy.setValue(1);
    mySliderSz.setValue(1);
    setCadValues();
}

function resetRotation(){
    mySliderRx.setValue(0);
    mySliderRy.setValue(0);
    mySliderRz.setValue(0);
    setCadValues();
}

function resetPosition(){
    mySliderPx.setValue(0);
    mySliderPy.setValue(0);
    mySliderPz.setValue(0);
    setCadValues();
}

function setCadValues(){
    window.inpSx = $("#inpSx").val();
    window.inpSy = $("#inpSy").val();
    window.inpSz = $("#inpSz").val();
    window.inpRx = $("#inpRx").val();
    window.inpRy = $("#inpRy").val();
    window.inpRz = $("#inpRz").val();
    window.inpPx = $("#inpPx").val();
    window.inpPy = $("#inpPy").val();
    window.inpPz = $("#inpPz").val();
}

function handleL1Click(cb){
    window.useLight1 = cb.checked;
}

function handleL2Click(cb){
    window.useLight2 = cb.checked;
}

