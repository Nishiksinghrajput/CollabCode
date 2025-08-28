// Simple runnable templates for each language
window.SimpleTemplates = {
  javascript: `// JavaScript - Ready to Run

function solution(nums) {
    // Write your solution here
    let result = 0;
    for (let num of nums) {
        result += num;
    }
    return result;
}

// Test the function
function main() {
    console.log(solution([1, 2, 3, 4, 5]));  // 15
    console.log(solution([10, -5, 7]));      // 12
    console.log(solution([]));               // 0
}

main();`,

  python: `# Python - Ready to Run

def solution(nums):
    # Write your solution here
    result = 0
    for num in nums:
        result += num
    return result

def main():
    print(solution([1, 2, 3, 4, 5]))  # 15
    print(solution([10, -5, 7]))      # 12
    print(solution([]))               # 0

if __name__ == "__main__":
    main()`,

  java: `// Java - Ready to Run

import java.util.*;

public class Solution {
    
    public static int solution(int[] nums) {
        // Write your solution here
        int result = 0;
        for (int num : nums) {
            result += num;
        }
        return result;
    }
    
    public static void main(String[] args) {
        System.out.println(solution(new int[]{1, 2, 3, 4, 5}));  // 15
        System.out.println(solution(new int[]{10, -5, 7}));      // 12
        System.out.println(solution(new int[]{}));               // 0
    }
}`,

  c_cpp: `// C++ - Ready to Run

#include <iostream>
#include <vector>
using namespace std;

int solution(vector<int>& nums) {
    // Write your solution here
    int result = 0;
    for (int num : nums) {
        result += num;
    }
    return result;
}

int main() {
    vector<int> test1 = {1, 2, 3, 4, 5};
    vector<int> test2 = {10, -5, 7};
    vector<int> test3 = {};
    
    cout << solution(test1) << endl;  // 15
    cout << solution(test2) << endl;  // 12
    cout << solution(test3) << endl;  // 0
    
    return 0;
}`,

  csharp: `// C# - Ready to Run

using System;

public class Solution {
    
    public static int Solve(int[] nums) {
        // Write your solution here
        int result = 0;
        foreach (int num in nums) {
            result += num;
        }
        return result;
    }
    
    public static void Main() {
        Console.WriteLine(Solve(new int[] {1, 2, 3, 4, 5}));  // 15
        Console.WriteLine(Solve(new int[] {10, -5, 7}));      // 12
        Console.WriteLine(Solve(new int[] {}));               // 0
    }
}`,

  go: `// Go - Ready to Run

package main

import "fmt"

func solution(nums []int) int {
    // Write your solution here
    result := 0
    for _, num := range nums {
        result += num
    }
    return result
}

func main() {
    fmt.Println(solution([]int{1, 2, 3, 4, 5}))  // 15
    fmt.Println(solution([]int{10, -5, 7}))      // 12
    fmt.Println(solution([]int{}))               // 0
}`,

  rust: `// Rust - Ready to Run

fn solution(nums: Vec<i32>) -> i32 {
    // Write your solution here
    let mut result = 0;
    for num in nums {
        result += num;
    }
    result
}

fn main() {
    println!("{}", solution(vec![1, 2, 3, 4, 5]));  // 15
    println!("{}", solution(vec![10, -5, 7]));      // 12
    println!("{}", solution(vec![]));               // 0
}`,

  typescript: `// TypeScript - Ready to Run

function solution(nums: number[]): number {
    // Write your solution here
    let result: number = 0;
    for (const num of nums) {
        result += num;
    }
    return result;
}

function main(): void {
    console.log(solution([1, 2, 3, 4, 5]));  // 15
    console.log(solution([10, -5, 7]));      // 12
    console.log(solution([]));               // 0
}

main();`,

  swift: `// Swift - Ready to Run

import Foundation

func solution(_ nums: [Int]) -> Int {
    // Write your solution here
    var result = 0
    for num in nums {
        result += num
    }
    return result
}

// Main execution
print(solution([1, 2, 3, 4, 5]))  // 15
print(solution([10, -5, 7]))      // 12
print(solution([]))               // 0`,

  kotlin: `// Kotlin - Ready to Run

fun solution(nums: IntArray): Int {
    // Write your solution here
    var result = 0
    for (num in nums) {
        result += num
    }
    return result
}

fun main() {
    println(solution(intArrayOf(1, 2, 3, 4, 5)))  // 15
    println(solution(intArrayOf(10, -5, 7)))      // 12
    println(solution(intArrayOf()))               // 0
}`,

  ruby: `# Ruby - Ready to Run

def solution(nums)
  # Write your solution here
  result = 0
  nums.each do |num|
    result += num
  end
  result
end

# Main execution
puts solution([1, 2, 3, 4, 5])  # 15
puts solution([10, -5, 7])      # 12
puts solution([])               # 0`,

  php: `<?php
// PHP - Ready to Run

function solution($nums) {
    // Write your solution here
    $result = 0;
    foreach ($nums as $num) {
        $result += $num;
    }
    return $result;
}

// Main execution
echo solution([1, 2, 3, 4, 5]) . PHP_EOL;  // 15
echo solution([10, -5, 7]) . PHP_EOL;      // 12
echo solution([]) . PHP_EOL;               // 0
?>`,

  scala: `// Scala - Ready to Run

object Solution {
  def solution(nums: Array[Int]): Int = {
    // Write your solution here
    var result = 0
    for (num <- nums) {
      result += num
    }
    result
  }
  
  def main(args: Array[String]): Unit = {
    println(solution(Array(1, 2, 3, 4, 5)))  // 15
    println(solution(Array(10, -5, 7)))      // 12
    println(solution(Array()))               // 0
  }
}`,

  r: `# R - Ready to Run

solution <- function(nums) {
  # Write your solution here
  result <- sum(nums)
  return(result)
}

# Main execution
print(solution(c(1, 2, 3, 4, 5)))  # 15
print(solution(c(10, -5, 7)))      # 12
print(solution(c()))               # 0`,

  perl: `#!/usr/bin/perl
# Perl - Ready to Run

use strict;
use warnings;

sub solution {
    my @nums = @_;
    # Write your solution here
    my $result = 0;
    foreach my $num (@nums) {
        $result += $num;
    }
    return $result;
}

# Main execution
print solution(1, 2, 3, 4, 5) . "\n";  # 15
print solution(10, -5, 7) . "\n";      # 12
print solution() . "\n";               # 0`,

  lua: `-- Lua - Ready to Run

function solution(nums)
    -- Write your solution here
    local result = 0
    for _, num in ipairs(nums) do
        result = result + num
    end
    return result
end

-- Main execution
print(solution({1, 2, 3, 4, 5}))  -- 15
print(solution({10, -5, 7}))      -- 12
print(solution({}))               -- 0`,

  haskell: `-- Haskell - Ready to Run

solution :: [Int] -> Int
solution nums = sum nums  -- Write your solution here

main :: IO ()
main = do
    print $ solution [1, 2, 3, 4, 5]  -- 15
    print $ solution [10, -5, 7]      -- 12
    print $ solution []               -- 0`,

  elixir: `# Elixir - Ready to Run

defmodule Solution do
  def solve(nums) do
    # Write your solution here
    Enum.sum(nums)
  end
end

# Main execution
IO.inspect Solution.solve([1, 2, 3, 4, 5])  # 15
IO.inspect Solution.solve([10, -5, 7])      # 12
IO.inspect Solution.solve([])               # 0`,

  dart: `// Dart - Ready to Run

int solution(List<int> nums) {
  // Write your solution here
  int result = 0;
  for (int num in nums) {
    result += num;
  }
  return result;
}

void main() {
  print(solution([1, 2, 3, 4, 5]));  // 15
  print(solution([10, -5, 7]));      // 12
  print(solution([]));               // 0
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Project</title>
</head>
<body>
    <h1>Hello World</h1>
    <div id="output"></div>
    
    <script>
        // JavaScript code here
        document.getElementById('output').innerHTML = 'Ready to code!';
    </script>
</body>
</html>`,

  css: `/* CSS Styling */

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f0f0f0;
}

h1 {
    color: #333;
    text-align: center;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}`,

  sql: `-- SQL Queries

-- Create table
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO users (id, name, email) VALUES 
(1, 'John Doe', 'john@example.com'),
(2, 'Jane Smith', 'jane@example.com');

-- Select data
SELECT * FROM users;
SELECT name, email FROM users WHERE id = 1;
SELECT COUNT(*) FROM users;`,

  json: `{
  "name": "Sample Project",
  "version": "1.0.0",
  "data": [
    {
      "id": 1,
      "value": "Item 1"
    },
    {
      "id": 2,
      "value": "Item 2"
    }
  ]
}`,

  yaml: `# YAML Configuration
name: Sample Project
version: 1.0.0

services:
  - name: api
    port: 8080
    replicas: 3
    
  - name: database
    port: 5432
    type: postgresql`,

  xml: `<?xml version="1.0" encoding="UTF-8"?>
<root>
    <project>
        <name>Sample Project</name>
        <version>1.0.0</version>
    </project>
    <items>
        <item id="1">Item 1</item>
        <item id="2">Item 2</item>
    </items>
</root>`,

  markdown: `# Project Title

## Description
Write your description here.

## Code Example
\`\`\`javascript
function example() {
    return "Hello World";
}
\`\`\`

## Lists
- Item 1
- Item 2
- Item 3

## Table
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |`
};