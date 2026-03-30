---
title: (Python) 클래스
created: 2025-11-08
modified: 2025-11-08 16:31
cssclasses:
  - max
tags:
  - python/class
---
> [!summary] 요약
> - 

---
# 1. 개여
## 1.1 클래스란?

> [!question] Python에서 클래스(class)
> - 


객체(Object)와 인스턴스(Instance)
객체는 클래스에서 만들어진 실체를 객체라고 하고, 이 객체와 클래스 간 관계를 표현하는데 잇어 인스턴스를 사용한다.
즉, 객체들은 클래스의 인스턴스들이다.

어떻게 보면 동일한 내용을 이야기하는 듯 하지만, 객체(object)는 


- **파이썬 클래스(class)란?**
    

클래스는 객체를 표현하기 위한 문법으로 체크박스, 스크롤바 같은 특정한 개념이나 모양을 존재하는것을 객체(object)라고 부릅니다. 이렇게 객체를 사용한 프로그래밍 언어를 객체 지향(object oriented) 언어라고 부르며 평소에 자주 사용되는 list, dict 등도 모두 각자의 용도에 맞게 만들어진 클래스 입니다.

클래스에는 크게 속성과 메소드 두가지로 구분되는데, 당장은 속성의 경우 매개변수를 받고 사용하기 위한 값을 정의하며 메소드는 만들어진 속성들을 이용해 어떤 행위를 하는 실행 코드라고 생각하셔도 됩니다.

예시 들자면 게임의 클래스(직업)를 생각하면 되는데, 각각의 클래스(전사, 마법사, 궁수 등)가 있고 그 안의 속성(힘, 민첩, 지력, 운, 물리공격력, 마법공격력)이 있으며 각각의 메소드(찌르기, 파이어볼, 활쏘기 등)가 있다고 생각하셔도 됩니다.

출처: [https://nirsa.tistory.com/110](https://nirsa.tistory.com/110) [The Nirsa Way:티스토리]

## 1.2 필요한 이유

---
# 2. 활용

## 2.1 생성

> [!hint] 클래스(class) 이름 짓기
> - 대문자로 시작
> - 단어와 단어 사이 연결도 대문자
> - 예시) `class FourCalucation`

클래스 내에서 사용하는 변수 설정을 하기 위해 `___init__(self)` 활용 여기서 `self`는 해당 클래스에서 사용되는 로컬변수 역할을 지정한다.

아래 예시는 `FourCalculation`이라는 클래스를 생성하고, 클래스에 `first`, `second` 입력하면 클래스 내 함수들에 변수 값들은 입력 값들이 고정적으로 활용된다.

```python
# fourcalculation.py

class FourCalculation:  
    def __init__(self, first, second):  
        self.first = first  
        self.second = second  
  
        if second == 0:  
            raise ValueError('the number must NOT be zero')  
  
    def add(self):  
        return self.first + self.second  
    def div(self):
	    return self.first / self.second
```
## 2.2 사용

클래스 사용
- `.py`파일 불러와 클래스 임포트
- `b`라는 객체에 클래스 정보 입력
- 메서드 활용하여 계산

```python fold title:클래스_사용법.py
from fourcalculation import FourCalculation
# import fourcalculation as fc

b = FourCalculation(19, 8)
# b = fc.FourCalculation(19, 8)

print(b.add(), b.mul(), b.sub(), b.div())
```


## 2.3 상속

---
# 3. 예제


## 클래스 생성

- 클래스 이름 짓기
	- 대문자로 시작
	- 단어와 단어 사이 연결은 대문자
- `__init__(self)`
	- 클래스 내 사용 변수 설정
	- `self`: 해당 클래스에서 사용되는 로컬변수 설정

```python
class FourCalculation:  
    """A class for four aritthmetic calculation"""  
  
    # __init__으로 시작: 클래스 내 사용 변수 설정  
    # self: 해당 클래스에서 사용되는 로컬변수 역할 지정    
    def __init__(self, first, second):  
        self.first = first  
        self.second = second  
  
        if second == 0:  
            raise ValueError('the number must NOT be zero')  
  
    def add(self):  
        return self.first + self.second  
  
    def mul(self):  
        return self.first * self.second  
  
    def sub(self):  
        return self.first - self.second  
  
    def div(self):  
        return self.first / self.second

%save fourcalculation.py
```

## 클래스 사용
- `.py`파일 불러와 클래스 임포트
- `b`라는 객체에 클래스 정보 입력
- 메서드 활용하여 계산

```python fold title:클래스_사용법.py
from fourcalculation import FourCalculation
# import fourcalculation as fc

b = FourCalculation(19, 8)
# b = fc.FourCalculation(19, 8)

print(b.add(), b.mul(), b.sub(), b.div())
```

## 클래스 상속
> [!hint] SuperClass와 SubClass
> - SuperClass: 부모 클래스
> - SubClass: 자식 클래스로, 상위 클래스를 상속 받아서 해당 클래스 내 변수와 메서드 사용가능
> 	- 확장 및 구체화할 떄 사용
> 	- 객체 지향 코딩에 유용함

- 부모 클래스(super class)를 상속 받아서 해당 클래스 변수 및 메서드 모두 상속
- 단, 변경가능 > overriding

- `class ClassName(SuperClass)`
- `super().__init__(first, second)` 슈퍼클래스에 변수 활용
	- 단, third는 새롭게 설정
- 메서드 변경

```python
from fourcalculation import FourCalculation

class FiveCalculation(FourCalculation):
	"""Adding power calculation"""

	def __init__(self, first, second, third):
		super().__init__(first, second)
		self.third = third

	def pow(self):
		return self.first ** self.second + self.third

	def div(self): # Method overriding
		if self.second == 0:
			return 0
		else:
			return self.first/self.second
```

```python
c = FiveCalculation(4, 2, 3)
print(c.pow(), c.add(), c.sub())
```


## 예시
- Employee 클래스에 `GetEmployee()` 메스드 내 사용되는 `Name()` 메서드
- 상위 클래스를 상속받았기 때문에 사용가능
```python
# SuperClass
class Person:

	def __init__(self, first, last):
		self.firstname = first
		self.lastname = last

	def Name(self):
		return self.firstname + " " + self.lastname

# SubClass
class Employee(Person):

	def __init__(self, first, last, staffnum):
		Person.__init__(self, first, last)
		self.staffnumber = staffnum

	def GetEmployee(self):
		return self.Name() + "," + self.staffnumber


x = Person('haejun', 'hyun')
x.Name()
y = Employee('haejun', 'hyun','1234')
x.GetEmployee()
```

---
>[!example] 참고사이트
>- [파이썬 클래스란?](https://nirsa.tistory.com/110)
>- [파이썬 class 정의와 사용법 - 함수와의 차이점](https://kevinitcoding.tistory.com/entry/%ED%8C%8C%EC%9D%B4%EC%8D%ACPython-Class%EC%9D%98-%EC%A0%95%EC%9D%98%EC%99%80-%EC%82%AC%EC%9A%A9%EB%B2%95feat-%ED%95%A8%EC%88%98%EC%99%80%EC%9D%98-%EC%B0%A8%EC%9D%B4)
