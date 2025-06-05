#include<iostream>
using namespace std;
class Base {
public:
    virtual void display() {
        cout << "Display of Base class" << endl;
    }
    virtual void kill(){
        cout<<"Kill Everyone"<<endl;
    }
};

class Derived : public Base {
public:
    void display() override {
        cout << "Display of Derived class" << endl;
    }
};

int main() {
    Base* b; 
    Derived d;
    b = &d;
    b->display(); // Calls Derived's display due to polymorphism
    b->kill();
    return 0;
}
