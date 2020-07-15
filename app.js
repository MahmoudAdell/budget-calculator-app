//budget controller
var budgetController =(function(){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage =-1;
    }
    Expense.prototype.calcPercentages=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);           
           }else{
              this.percentage =-1; 
           }

    }
    Expense.prototype.getPercentages=function(){
        return this.percentage;
    }
    
    
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }    
    
    
    
    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:0
    };
    
    
    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
           sum=sum+cur.value; 
        });
        data.totals[type]=sum;
    };
    
    return{
        addItem:function(type,des,val){
            var nawItem,ID;
            if(data.allItems[type].length >0){
                ID=data.allItems[type][data.allItems[type].length -1].id +1;               
            }
            else{
             ID=0;   
            }
            

            
            if(type==='exp'){
                newItem=new Expense(ID,des,val);
            }
            else if(type==='inc'){
                newItem=new Income(ID,des,val);        
            }
            
            data.allItems[type].push(newItem);
            return newItem;
            
        },
        
        
        calculateBudget:function(){
            calculateTotal('inc');
            calculateTotal('exp');
            
            data.budget=data.totals.inc - data.totals.exp;
            if(data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp / data.totals.inc)*100);                

            }else{
               data.percentage=-1; 
            }

            
        },

        getBudget:function(){
          return {
              budget:data.budget,
              totalInc:data.totals.inc,
              totalExp:data.totals.exp,
              percentage:data.percentage
          };  
        },
        delitemDS:function(type,id){
            var ids,index;
            ids = data.allItems[type].map(function(current){
                return current.id;
                
            });
            index = ids.indexOf(id);
            data.allItems[type].splice(index,1);
        },
        calcPercentages:function(){
            
        },
            
        
        
        
        testing:function(){
            console.log(data);
        }
    }
    
    
})();



//UI controler
var UIController=(function(){
    var DOMstrings={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        
        
    };
    
    return {
        getInput:function(){
            return{
                type:document.querySelector(DOMstrings.inputType).value, description:document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)                
                
            };

        },
        addListItem:function(obj,type){
           var html,newHtml,element; 
            
            if(type==='inc'){
                element=DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'                
            }else if(type==='exp'){
                element=DOMstrings.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'                
            }
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            
            newHtml=newHtml.replace('%value%',obj.value);
            
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml) 
            
            
            
            
        },
        
        deleteListItem:function(selectedID){
            var selectedItem;
            selectedItem=document.getElementById(selectedID); 
            selectedItem.parentNode.removeChild(selectedItem);
        },
        
        clearFields:function(){
          var fields,fieldsArr;
            fields=document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputValue)
            
            fieldsArr=Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array){
                current.value="";
                
            fieldsArr[0].focus();    
                
            });
            
            
            
            
        },
        displayBudget:function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent=obj.budget; document.querySelector(DOMstrings.incomeLabel).textContent=obj.totalInc; document.querySelector(DOMstrings.expensesLabel).textContent=obj.totalExp; document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage;
            
            if(obj.percentage >0){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage +' %';
            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent='---';
            }
            
            
        },        
        
        getDOMstrings:function(){
            return DOMstrings; 
        }
        
    }
    
})();


//global app controller
var controller=(function(budgetCtrl,UICtrl){
    
    var setupEventListners=function(){
        var DOM=UICtrl.getDOMstrings(); 
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);    
        
        
        document.addEventListener('keypress',function(event){
        if(event.keyCode ===13 || event.which ===13){
            ctrlAddItem();
            
            }
            
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
            
            
        
        });    
        
    };
    
    var updateBudget=function(){
        budgetController.calculateBudget();
        var budget=budgetController.getBudget();
        UICtrl.displayBudget(budget);
        
        
    };
    
    var updatePercentages=function(){
        budgetCtrl.calculateBudget();
        budgetCtrl.addItem.exp.forEach(function(cur){
            cur.calcPercentages();
        });
        
        
    };
     
   var ctrlAddItem = function(){
       
       var input,newItem;
       input=UICtrl.getInput();
       console.log(input);
       if(input.description!=="" &&! isNaN(input.value) && input.value >0){
           newItem=budgetController.addItem(input.type,input.description,input.value);

       
           UICtrl.addListItem(newItem,input.type);

           UICtrl.clearFields();

           updateBudget();  
           //update percentages
           calcPercentages();
          }
       
       
        
   }; 
    
    var ctrlDeleteItem = function(event){
       var itemID ,splitID;
       itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitID=itemID.split('-');
        type=splitID[0];
        ID=splitID[1];
        
        budgetController.delitemDS(type,parseInt(ID));
        budgetController.testing();
        
        //delete item from ui
        UICtrl.deleteListItem(itemID);
        
        //update bugdet
        updateBudget();
        //update percentages
        calcPercentages();
        
        
    };
    
    
    
   
    return{
        init:function(){
            UICtrl.displayBudget({
              budget:0,
              totalInc:0,
              totalExp:0,
              percentage:-1               
            });
            console.log('application has started.');
            setupEventListners();
            
        }
    };
    
        
    

})(budgetController,UIController);

controller.init();  



let age=19;    
console.log(`mahmoud is ${age} years old`); 
const a=['1999','1998'];
const res=a.map(el=>2016-el);
console.log(res);

function person(name){
    this.name=name;
}

person.prototype.myFriends5=function(friends){
    var arr=friends.map(function(el){
        return el+' is friend of '+ this.name;
    });
    console.log(arr);
};

var  friends=['abdo','adel','mahmoud'];
new person('joan').myFriends5(friends);