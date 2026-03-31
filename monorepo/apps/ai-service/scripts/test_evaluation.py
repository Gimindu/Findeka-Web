"""
Quick test script to identify evaluation errors
"""
import sys
import traceback
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    print("[1/4] Testing imports...")
    from models_loader import model_manager
    from logic import extract_features, calculate_match_score
    from evaluation.evaluate_with_images import ExperimentEvaluatorWithImages
    from evaluation.text_data_loader import TextDataLoader
    from evaluation.evaluation_config import EvaluationConfig
    print("[OK] All imports successful")
    
    print("\n[2/4] Testing TextDataLoader...")
    config = EvaluationConfig()
    text_loader = TextDataLoader(config)
    test_data = text_loader.get_all_text_data()
    print(f"[OK] TextDataLoader initialized with {len(test_data)} items")
    print(f"     Sample: {list(test_data.keys())[:3]}")
    
    print("\n[3/4] Testing ExperimentEvaluatorWithImages...")
    evaluator = ExperimentEvaluatorWithImages()
    print(f"[OK] ExperimentEvaluatorWithImages initialized")
    print(f"     Output dir: {evaluator.output_dir}")
    print(f"     Test images loaded: {len(evaluator.image_loader.get_images())}")
    
    print("\n[4/4] Testing add_experiment...")
    evaluator.add_experiment(
        name='Test Experiment',
        accuracy=0.85,
        precision=0.88,
        recall=0.82,
        f1_score=0.85,
        images_used=6,
        details='Test experiment'
    )
    print("[OK] Experiment added")
    
    print("\n[5/5] Testing print_results...")
    evaluator.print_results()
    print("[OK] Print results completed")
    
    print("\n[SUCCESS] ALL TESTS PASSED")
    
except Exception as e:
    print(f"\n[ERROR] {e}")
    print("\nFull traceback:")
    import traceback
    traceback.print_exc()
    import sys
    sys.exit(1)
