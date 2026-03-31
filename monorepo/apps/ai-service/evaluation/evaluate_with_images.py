"""
Experiment Evaluation with Test Images

This module evaluates experiments using actual test images from the test_images folder.
It processes images and generates comprehensive evaluation metrics.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime
from PIL import Image
import hashlib

from .evaluation_config import EvaluationConfig

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ImageDataLoader:
    """Loads and manages test images for evaluation."""
    
    def __init__(self, config: EvaluationConfig):
        """
        Initialize image data loader.
        
        Args:
            config: Evaluation configuration
        """
        self.config = config
        self.test_images_dir = Path(config.test_images_dir)
        self.images = {}
        self._load_images()
    
    def _load_images(self) -> None:
        """Load all test images from directory."""
        if not self.test_images_dir.exists():
            logger.warning(f"Test images directory not found: {self.test_images_dir}")
            return
        
        image_extensions = {'.png', '.jpg', '.jpeg', '.bmp', '.gif'}
        
        for image_file in self.test_images_dir.iterdir():
            if image_file.suffix.lower() in image_extensions:
                try:
                    img = Image.open(image_file)
                    self.images[image_file.stem] = {
                        'path': image_file,
                        'size': img.size,
                        'format': img.format,
                        'mode': img.mode,
                        'filename': image_file.name,
                    }
                    logger.info(f"Loaded image: {image_file.name} ({img.size[0]}x{img.size[1]})")
                except Exception as e:
                    logger.error(f"Failed to load image {image_file.name}: {e}")
    
    def get_images(self) -> Dict[str, Any]:
        """Get all loaded images."""
        return self.images
    
    def get_image_stats(self) -> Dict[str, Any]:
        """Get statistics about loaded images."""
        if not self.images:
            return {'total_images': 0, 'images': []}
        
        stats = {
            'total_images': len(self.images),
            'images': []
        }
        
        for name, img_info in self.images.items():
            stats['images'].append({
                'name': name,
                'filename': img_info['filename'],
                'size': f"{img_info['size'][0]}x{img_info['size'][1]}",
                'format': img_info['format'],
                'mode': img_info['mode'],
            })
        
        return stats


class ExperimentEvaluatorWithImages:
    """Evaluates experiments using actual test images."""
    
    def __init__(self, output_dir: Path = None):
        """
        Initialize evaluator with image support.
        
        Args:
            output_dir: Directory to save evaluation results
        """
        if output_dir is None:
            output_dir = Path(__file__).parent / "evaluation_results"
        
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.config = EvaluationConfig()
        self.image_loader = ImageDataLoader(self.config)
        self.experiments = {}
        
        logger.info(f"Evaluator initialized. Output dir: {self.output_dir}")
        logger.info(f"Loaded {len(self.image_loader.get_images())} test images")
    
    def add_experiment(self, name: str, accuracy: float, precision: float,
                      recall: float, f1_score: float,
                      rank1_accuracy: float = None,
                      mrr: float = None,
                      avg_correct_score: float = None,
                      avg_margin: float = None,
                      failure_rate: float = None,
                      images_used: int = 0, details: str = "") -> None:
        """
        Add experiment results.
        
        Args:
            name: Experiment name
            accuracy: Accuracy score
            precision: Precision score
            recall: Recall score
            f1_score: F1 score
            rank1_accuracy: Rank-1 retrieval accuracy
            mrr: Mean Reciprocal Rank
            avg_correct_score: Mean score of the true query-target pair
            avg_margin: Mean margin (true score - second-best score)
            failure_rate: Fraction of failed queries (1 - rank1_accuracy)
            images_used: Number of test images used
            details: Additional details
        """
        rank1_value = accuracy if rank1_accuracy is None else rank1_accuracy
        fail_value = (1.0 - rank1_value) if failure_rate is None else failure_rate

        self.experiments[name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'rank1_accuracy': rank1_value,
            'mrr': mrr,
            'avg_correct_score': avg_correct_score,
            'avg_margin': avg_margin,
            'failure_rate': fail_value,
            'images_used': images_used,
            'details': details,
            'timestamp': datetime.now().isoformat(),
        }
        logger.info(f"Added experiment: {name} (Images used: {images_used})")
    
    def generate_comparison_table(self) -> str:
        """Generate formatted comparison table."""
        if not self.experiments:
            return "No experiments data available."
        
        # Load image statistics
        image_stats = self.image_loader.get_image_stats()
        
        table = "\n" + "=" * 120 + "\n"
        table += "EXPERIMENT EVALUATION REPORT WITH TEST IMAGES\n"
        table += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        table += f"Test Images Available: {image_stats['total_images']}\n"
        table += "=" * 120 + "\n\n"
        
        # List test images
        table += "Test Images Used:\n"
        table += "-" * 120 + "\n"
        for img_info in image_stats['images']:
            table += f"  * {img_info['filename']:<30} | Size: {img_info['size']:<12} | Format: {img_info['format']}\n"
        table += "-" * 120 + "\n\n"
        
        # Comparison table header
        table += f"{'Experiment':<36} | {'Rank-1':<8} | {'MRR':<8} | {'AvgScore':<9} | {'AvgMargin':<10} | {'FailRate':<9} | {'Images':<6}\n"
        table += "-" * 120 + "\n"
        
        # Data rows
        for exp_name, metrics in self.experiments.items():
            rank1 = metrics.get('rank1_accuracy', metrics.get('accuracy', 0.0))
            mrr = metrics.get('mrr')
            avg_score = metrics.get('avg_correct_score')
            avg_margin = metrics.get('avg_margin')
            fail_rate = metrics.get('failure_rate', 1.0 - rank1)
            images_used = metrics['images_used']

            mrr_s = f"{mrr:.4f}" if isinstance(mrr, (int, float)) else "N/A"
            score_s = f"{avg_score:.4f}" if isinstance(avg_score, (int, float)) else "N/A"
            margin_s = f"{avg_margin:+.4f}" if isinstance(avg_margin, (int, float)) else "N/A"
            fail_s = f"{fail_rate * 100:.2f}%"

            table += (
                f"{exp_name:<36} | {rank1:<8.4f} | {mrr_s:<8} | {score_s:<9} | "
                f"{margin_s:<10} | {fail_s:<9} | {images_used:<6}\n"
            )
        
        table += "=" * 120 + "\n"
        return table
    
    def generate_detailed_report(self) -> str:
        """Generate detailed report with image information."""
        image_stats = self.image_loader.get_image_stats()
        
        report = "\n" + "=" * 120 + "\n"
        report += "DETAILED EXPERIMENT EVALUATION REPORT WITH TEST IMAGES\n"
        report += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        report += "=" * 120 + "\n"
        
        # Test Images Information
        report += f"\nTest Images Information:\n"
        report += "-" * 120 + "\n"
        report += f"Total Test Images: {image_stats['total_images']}\n"
        report += f"Location: {self.image_loader.test_images_dir}\n\n"
        
        for img_info in image_stats['images']:
            report += f"  {img_info['filename']}\n"
            report += f"    - Dimension: {img_info['size']}\n"
            report += f"    - Format: {img_info['format']}\n"
            report += f"    - Mode: {img_info['mode']}\n\n"
        
        # Experiments details
        report += "\nExperiment Results:\n"
        report += "=" * 120 + "\n"
        
        for exp_name, metrics in self.experiments.items():
            report += f"\n{'-' * 120}\n"
            report += f"Experiment: {exp_name}\n"
            report += f"{'-' * 120}\n"
            rank1 = metrics.get('rank1_accuracy', metrics.get('accuracy', 0.0))
            mrr = metrics.get('mrr')
            avg_score = metrics.get('avg_correct_score')
            avg_margin = metrics.get('avg_margin')
            fail_rate = metrics.get('failure_rate', 1.0 - rank1)

            report += f"Rank-1 Acc:   {rank1:<10.4f} ({rank1*100:>6.2f}%)\n"
            if isinstance(mrr, (int, float)):
                report += f"MRR:          {mrr:<10.4f}\n"
            if isinstance(avg_score, (int, float)):
                report += f"AvgScore:     {avg_score:<10.4f}\n"
            if isinstance(avg_margin, (int, float)):
                report += f"AvgMargin:    {avg_margin:<10.4f}\n"
            report += f"Failure Rate: {fail_rate:<10.4f} ({fail_rate*100:>6.2f}%)\n"
            report += f"Images Used:  {metrics['images_used']}/{image_stats['total_images']}\n"
            
            if metrics['details']:
                report += f"\nDetails:\n{metrics['details']}\n"
            
            report += f"Timestamp:    {metrics['timestamp']}\n"
        
        report += "\n" + "=" * 120 + "\n"
        return report
    
    def save_comparison_table(self, filename: str = "experiment_comparison_with_images.txt") -> Path:
        """Save comparison table."""
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(self.generate_comparison_table())
            logger.info(f"Comparison table saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save comparison table: {e}")
            raise
    
    def save_detailed_report(self, filename: str = "experiment_detailed_report_with_images.txt") -> Path:
        """Save detailed report."""
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(self.generate_detailed_report())
            logger.info(f"Detailed report saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save detailed report: {e}")
            raise
    
    def save_json_results(self, filename: str = "experiment_results_with_images.json") -> Path:
        """Save results as JSON with image info."""
        output_path = self.output_dir / filename
        
        data = {
            'test_images': self.image_loader.get_image_stats(),
            'experiments': self.experiments,
            'generated_at': datetime.now().isoformat(),
        }
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str, ensure_ascii=False)
            logger.info(f"JSON results saved to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to save JSON results: {e}")
            raise
    
    def print_results(self) -> None:
        """Print results to console."""
        print(self.generate_comparison_table())
        print(self.generate_detailed_report())


def main():
    """Main entry point."""
    logger.info("Image Evaluation Framework Initialized")
    logger.info("=" * 100)
    logger.info("USAGE: Import and use ExperimentEvaluatorWithImages with your REAL model metrics")
    logger.info("=" * 100)
    logger.info("")
    logger.info("Example:")
    logger.info("  from evaluation.evaluate_with_images import ExperimentEvaluatorWithImages")
    logger.info("")
    logger.info("  evaluator = ExperimentEvaluatorWithImages()")
    logger.info("  evaluator.add_experiment(")
    logger.info("      name='Your Model Name',")
    logger.info("      accuracy=your_actual_accuracy,")
    logger.info("      precision=your_actual_precision,")
    logger.info("      recall=your_actual_recall,")
    logger.info("      f1_score=your_actual_f1,")
    logger.info("      images_used=number_of_test_images,")
    logger.info("      details='Your model description'")
    logger.info("  )")
    logger.info("  evaluator.print_results()")
    logger.info("  evaluator.save_comparison_table()")
    logger.info("  evaluator.save_json_results()")
    logger.info("")
    logger.info("=" * 100)
    
    evaluator = ExperimentEvaluatorWithImages()
    total_images = len(evaluator.image_loader.get_images())
    
    logger.info(f"Loaded {total_images} test images from: {evaluator.image_loader.test_images_dir}")
    logger.info("Ready to evaluate your models with real metrics!")


if __name__ == "__main__":
    main()
