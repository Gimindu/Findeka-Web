"""
Model Evaluation Module

This module provides comprehensive evaluation functionality for AI models,
including performance metrics calculation and detailed reporting.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EvaluationReport:
    """Generates and manages evaluation reports."""
    
    def __init__(self, output_dir: Path):
        """
        Initialize evaluation report generator.
        
        Args:
            output_dir: Directory to save evaluation reports
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.results = {}
    
    def add_result(self, model_name: str, metrics: Dict[str, Any]) -> None:
        """
        Add evaluation results for a model.
        
        Args:
            model_name: Name of the model
            metrics: Dictionary containing evaluation metrics
        """
        self.results[model_name] = {
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
        }
        logger.info(f"Added results for model: {model_name}")
    
    def save_json(self, filename: str = "evaluation_results.json") -> Path:
        """
        Save evaluation results to JSON file.
        
        Args:
            filename: Name of the output JSON file
            
        Returns:
            Path to saved file
        """
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w') as f:
                json.dump(self.results, f, indent=2, default=str)
            logger.info(f"Evaluation results saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save evaluation results: {e}")
            raise
    
    def generate_summary(self) -> str:
        """
        Generate summary of evaluation results.
        
        Returns:
            String representation of evaluation summary
        """
        summary = "=" * 70 + "\n"
        summary += "EVALUATION SUMMARY REPORT\n"
        summary += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        summary += "=" * 70 + "\n\n"
        
        for model_name, result in self.results.items():
            summary += f"\nModel: {model_name}\n"
            summary += "-" * 70 + "\n"
            summary += f"Timestamp: {result['timestamp']}\n"
            summary += "\nMetrics:\n"
            
            metrics = result['metrics']
            for metric_name, value in metrics.items():
                if isinstance(value, float):
                    summary += f"  {metric_name}: {value:.4f}\n"
                else:
                    summary += f"  {metric_name}: {value}\n"
        
        summary += "\n" + "=" * 70 + "\n"
        return summary
    
    def save_summary(self, filename: str = "evaluation_summary.txt") -> Path:
        """
        Save evaluation summary to text file.
        
        Args:
            filename: Name of the output text file
            
        Returns:
            Path to saved file
        """
        output_path = self.output_dir / filename
        summary = self.generate_summary()
        
        try:
            with open(output_path, 'w') as f:
                f.write(summary)
            logger.info(f"Evaluation summary saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save evaluation summary: {e}")
            raise
    
    def print_summary(self) -> None:
        """Print evaluation summary to console."""
        print(self.generate_summary())


class ModelEvaluator:
    """Main evaluator class for running model evaluations."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize model evaluator.
        
        Args:
            config: Configuration dictionary for evaluation
        """
        self.config = config or {}
        self.report = EvaluationReport(
            self.config.get('results_dir', Path(__file__).parent / 'evaluation_results')
        )
        logger.info("Model evaluator initialized")
    
    def evaluate(self, test_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate model performance based on test results.
        
        Args:
            test_results: Dictionary containing test results
            
        Returns:
            Dictionary containing evaluation metrics
        """
        logger.info("Starting evaluation process")
        
        # Calculate metrics from test results
        metrics = {
            'total_tests': test_results.get('total_tests', 0),
            'passed_tests': test_results.get('passed_tests', 0),
            'failed_tests': test_results.get('failed_tests', 0),
        }
        
        if metrics['total_tests'] > 0:
            metrics['success_rate'] = (
                metrics['passed_tests'] / metrics['total_tests']
            )
        else:
            metrics['success_rate'] = 0.0
        
        logger.info(f"Evaluation metrics: {metrics}")
        return metrics
    
    def add_model_results(self, model_name: str, metrics: Dict[str, Any]) -> None:
        """
        Add results for a specific model to the report.
        
        Args:
            model_name: Name of the model
            metrics: Dictionary containing model metrics
        """
        self.report.add_result(model_name, metrics)
    
    def save_results(self) -> None:
        """Save all evaluation results to files."""
        self.report.save_json()
        self.report.save_summary()
        logger.info("All evaluation results saved")
    
    def print_report(self) -> None:
        """Print evaluation report to console."""
        self.report.print_summary()


def main():
    """Main entry point for evaluation module."""
    print("Module: ModelEvaluator")
    print("This module provides evaluation functionality for AI models")
    print()
    print("Usage Instructions:")
    print("Import this module and use ModelEvaluator with your REAL test results.")
    print()
    print("Example:")
    print("    from evaluation.evaluate_models import ModelEvaluator")
    print("    ")
    print("    evaluator = ModelEvaluator()")
    print("    ")
    print("    # Your REAL test results from evaluation")
    print("    test_results = {")
    print("        'total_tests': your_total_count,")
    print("        'passed_tests': your_passed_count,")
    print("        'failed_tests': your_failed_count,")
    print("    }")
    print("    ")
    print("    metrics = evaluator.evaluate(test_results)")
    print("    evaluator.add_model_results('your_model_name', metrics)")
    print("    evaluator.save_results()")


if __name__ == "__main__":
    main()
